import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { escapeHtml, sanitizeHeaderValue } from '@/lib/html';

const ORGANIZER_EMAIL = 'digitalvurv@gmail.com';

function validate(data: Record<string, unknown>): string | null {
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) return 'Name is required';
  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Invalid email format';
  if (!data.message || typeof data.message !== 'string' || !data.message.trim()) return 'Message is required';
  return null;
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`booking:${clientKey(req)}`, 10, 60 * 60 * 1000))) return tooManyRequests();

    const body = await req.json();
    const error = validate(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const inquiry = await prisma.bookingInquiry.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim(),
        organization: body.organization?.trim() || null,
        eventName: body.eventName?.trim() || null,
        message: body.message.trim(),
        status: 'new',
      },
    });

    // Send email notification
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: `"Désir Fils Speaker Page" <${process.env.SMTP_USER}>`,
          to: ORGANIZER_EMAIL,
          subject: `New Booking Inquiry from ${sanitizeHeaderValue(body.name)}`,
          html: buildEmailHtml(body),
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    } else {
      console.log('SMTP not configured — email skipped. Inquiry stored in DB.');
    }

    return NextResponse.json({ id: inquiry.id, status: 'new' }, { status: 201 });
  } catch (err) {
    console.error('Booking inquiry error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function buildEmailHtml(data: Record<string, any>): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const organization = data.organization ? escapeHtml(data.organization) : '';
  const eventName = data.eventName ? escapeHtml(data.eventName) : '';
  const message = escapeHtml(data.message);

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#ED145A;">New Speaking Inquiry</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#888;width:120px">Name</td><td style="padding:8px 0">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
        ${organization ? `<tr><td style="padding:8px 0;color:#888">Organization</td><td style="padding:8px 0">${organization}</td></tr>` : ''}
        ${eventName ? `<tr><td style="padding:8px 0;color:#888">Event</td><td style="padding:8px 0">${eventName}</td></tr>` : ''}
      </table>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
      <p style="color:#333">${message}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
      <p style="font-size:12px;color:#999">Sent from the Désir Fils speaker page.</p>
    </div>
  `;
}
