import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nd from 'nodemailer';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { qualifyLead, scoreLead } from '@/lib/growth';

const SEGMENTS = ['media_agency', 'luxury_hospitality', 'corporate_lifestyle', 'other'];
const REVENUE_BUCKETS = ['<1M', '1M-5M', '5M-20M', '20M+'];
const TIMELINES = ['immediate', '<30days', '30-90days', '90days+', ''];
const SERVICE_INTERESTS = ['retainer', 'project', 'audit', 'technical-custom', ''];

interface GrowthLeadBody {
  firstName: string;
  lastName?: string;
  email: string;
  company?: string;
  segment?: string;
  annualRevenue?: string;
  monthlySpend?: number;
  projectBudget?: number;
  retainerBudget?: number;
  decisionTimeline?: string;
  serviceInterest?: string;
  message?: string;
  consent: boolean;
}

function toIntOrUndefined(v: unknown): number | undefined {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

function validate(data: GrowthLeadBody): string | null {
  if (!data.firstName || typeof data.firstName !== 'string' || !data.firstName.trim()) {
    return 'First name is required';
  }
  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    return 'Email is required';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Invalid email format';
  }
  if (data.segment && !SEGMENTS.includes(data.segment)) {
    return 'Unknown segment';
  }
  if (data.annualRevenue && !REVENUE_BUCKETS.includes(data.annualRevenue)) {
    return 'Unknown revenue bucket';
  }
  if (data.decisionTimeline && !TIMELINES.includes(data.decisionTimeline)) {
    return 'Unknown decision timeline';
  }
  if (data.consent !== true) {
    return 'Consent is required to proceed';
  }
  return null;
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`growth-lead:${clientKey(req)}`, 10, 60 * 60 * 1000))) {
      return tooManyRequests();
    }

    const body = (await req.json()) as GrowthLeadBody;
    const error = validate(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const segment = SEGMENTS.includes(body.segment ?? '') ? (body.segment as string) : 'other';
    const decisionTimeline =
      body.decisionTimeline && body.decisionTimeline !== '' ? (body.decisionTimeline as string) : undefined;

    const monthlySpend = toIntOrUndefined(body.monthlySpend);
    const projectBudget = toIntOrUndefined(body.projectBudget);
    const retainerBudget = toIntOrUndefined(body.retainerBudget);

    const qualification = qualifyLead({
      segment: segment as 'media_agency' | 'luxury_hospitality' | 'corporate_lifestyle' | 'other',
      annualRevenue: body.annualRevenue,
      monthlySpend,
      projectBudget,
      retainerBudget,
      decisionTimeline,
      hasAuthority: decisionTimeline === 'immediate' || decisionTimeline === '<30days',
      serviceInterest: body.serviceInterest,
    });

    const { score, tier } = scoreLead(['form_submission']);

    let savedId: string | null = null;
    try {
      const record = await prisma.growthLead.create({
        data: {
          firstName: body.firstName.trim(),
          lastName: body.lastName?.trim() || null,
          email: body.email.trim().toLowerCase(),
          company: body.company?.trim() || null,
          segment,
          annualRevenue: body.annualRevenue || null,
          monthlySpend,
          projectBudget,
          retainerBudget,
          decisionTimeline,
          serviceInterest: body.serviceInterest || null,
          message: body.message?.trim() || null,
          score,
          tier,
          status: qualification.verdict === 'sales_ready' ? 'warm' : 'new',
          consent: true,
          lastTouchAt: new Date(),
        },
      });
      savedId = record.id;
    } catch (dbError) {
      // Database not wired up yet (e.g. no DATABASE_URL): accept the lead anyway.
      console.error('growth-lead: database write failed', dbError);
    }

    if (process.env.NOTIFY_EMAIL && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nd.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from: `"WhoIsDésir Growth" <${process.env.SMTP_USER}>`,
          to: process.env.NOTIFY_EMAIL,
          subject: `New growth lead: ${body.firstName} ${body.lastName ?? ''} (${qualification.verdict})`,
          text: buildSummary(body, qualification.verdict),
        });
      } catch (emailError) {
        console.error('growth-lead: email notification failed', emailError);
      }
    }

    return NextResponse.json(
      {
        id: savedId,
        tier,
        verdict: qualification.verdict,
        accepted: true,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('growth-lead error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function buildSummary(body: GrowthLeadBody, verdict: string): string {
  return [
    `Name: ${body.firstName} ${body.lastName ?? ''}`,
    `Email: ${body.email}`,
    body.company ? `Company: ${body.company}` : '',
    `Segment: ${body.segment ?? '—'}`,
    body.annualRevenue ? `Annual revenue: ${body.annualRevenue}` : '',
    body.monthlySpend ? `Monthly spend: $${body.monthlySpend}` : '',
    body.retainerBudget ? `Retainer budget: $${body.retainerBudget}` : '',
    body.projectBudget ? `Project budget: $${body.projectBudget}` : '',
    body.decisionTimeline ? `Decision timeline: ${body.decisionTimeline}` : '',
    `Verdict: ${verdict}`,
    body.message ? `\nMessage:\n${body.message}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}