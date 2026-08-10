import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

const OWNER_EMAIL = 'digitalvurv@gmail.com';

function validate(data: Record<string, unknown>): string | null {
  if (!data.firstName || typeof data.firstName !== 'string' || !data.firstName.trim())
    return 'First name is required';
  if (!data.lastName || typeof data.lastName !== 'string' || !data.lastName.trim())
    return 'Last name is required';
  if (!data.email || typeof data.email !== 'string' || !data.email.trim())
    return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email as string))
    return 'Invalid email format';
  if (!data.city || typeof data.city !== 'string' || !data.city.trim())
    return 'City is required';
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Save lead to database
    const lead = await prisma.pluginDownloadLead.create({
      data: {
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: body.email.trim().toLowerCase(),
        city: body.city.trim(),
        plugin: body.plugin || 'amazon-associates-snippets',
        version: body.version || '1.1.0',
      },
    });

    // Send notification email (graceful skip if SMTP not configured)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: `"WhoIsDésir® Media Agency" <${process.env.SMTP_USER}>`,
          to: OWNER_EMAIL,
          subject: `🔌 New Plugin Download Lead: ${body.firstName} ${body.lastName}`,
          html: buildEmailHtml(body),
        });
      } catch (emailErr) {
        console.error('Email notification failed (non-fatal):', emailErr);
      }
    } else {
      console.log('SMTP not configured — email skipped. Lead stored in DB:', lead.id);
    }

    return NextResponse.json({ id: lead.id, success: true }, { status: 201 });
  } catch (err) {
    console.error('Plugin download lead error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

function buildEmailHtml(data: Record<string, any>): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
      <h2 style="color:#FF9900;margin-bottom:8px">🔌 New Plugin Download Lead</h2>
      <p style="color:#64748b;margin-bottom:24px;font-size:14px">Someone just downloaded the <strong>${data.plugin || 'Amazon Associates PHP Snippets'} v${data.version || '1.1.0'}</strong> plugin.</p>
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden">
        <tr style="background:#fff8f0">
          <td style="padding:12px 16px;color:#94a3b8;font-size:13px;width:130px">First Name</td>
          <td style="padding:12px 16px;font-weight:600">${data.firstName}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#94a3b8;font-size:13px">Last Name</td>
          <td style="padding:12px 16px;font-weight:600">${data.lastName}</td>
        </tr>
        <tr style="background:#fff8f0">
          <td style="padding:12px 16px;color:#94a3b8;font-size:13px">Email</td>
          <td style="padding:12px 16px"><a href="mailto:${data.email}" style="color:#FF9900">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#94a3b8;font-size:13px">City</td>
          <td style="padding:12px 16px">${data.city}</td>
        </tr>
        <tr style="background:#fff8f0">
          <td style="padding:12px 16px;color:#94a3b8;font-size:13px">Plugin</td>
          <td style="padding:12px 16px">${data.plugin || 'amazon-associates-snippets'} v${data.version || '1.1.0'}</td>
        </tr>
      </table>
      <p style="font-size:12px;color:#94a3b8;margin-top:20px">Sent automatically by WhoIsDésir® Media Agency plugin download system.</p>
    </div>
  `;
}
