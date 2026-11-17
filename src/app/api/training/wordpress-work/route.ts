import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContractor, isNextResponse } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { hasWordPressDeveloperRole, WORDPRESS_DEVELOPER_ROLE } from '@/lib/wordpress-quiz';

const REQUIRED_FIELDS = [
  'city',
  'pageName',
  'pageUrl',
  'seoTitle',
  'focusKeyphrase',
  'slug',
  'metaDescription',
  'socialTitle',
  'socialDescription',
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

function text(value: unknown, max = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function optionalUrl(value: unknown): string | null {
  const raw = text(value, 2000);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function isEligibleWordPressDeveloper(contractorId: string): Promise<boolean> {
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
    select: { role: true, roles: { select: { role: true, status: true } } },
  });
  if (!contractor) return false;
  const approved = contractor.roles.filter((r) => r.status === 'approved').map((r) => r.role);
  return hasWordPressDeveloperRole(contractor.role, approved);
}

export async function GET() {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const contractorId = user.contractorId;
    if (!contractorId) {
      return NextResponse.json({ error: 'No contractor profile linked to this account' }, { status: 400 });
    }

    const submissions = await prisma.wordPressWorkSubmission.findMany({
      where: { contractorId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error('[wordpress-work] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireContractor();
    if (isNextResponse(user)) return user;

    const contractorId = user.contractorId;
    if (!contractorId) {
      return NextResponse.json({ error: 'No contractor profile linked to this account' }, { status: 400 });
    }

    if (!(await isEligibleWordPressDeveloper(contractorId))) {
      return NextResponse.json(
        { error: `Only ${WORDPRESS_DEVELOPER_ROLE} contractors can submit WordPress work.` },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const values = {} as Record<RequiredField, string>;
    const missing: string[] = [];

    for (const field of REQUIRED_FIELDS) {
      const value = text((body as Record<string, unknown>)[field], field === 'metaDescription' ? 500 : 300);
      if (!value) missing.push(field);
      values[field] = value;
    }

    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    const pageUrl = optionalUrl(values.pageUrl);
    if (!pageUrl) {
      return NextResponse.json({ error: 'pageUrl must be a valid http(s) URL' }, { status: 400 });
    }

    const editUrl = optionalUrl((body as Record<string, unknown>).editUrl);
    const canonicalUrl = optionalUrl((body as Record<string, unknown>).canonicalUrl);
    const slug = slugify(values.slug);

    const submission = await prisma.wordPressWorkSubmission.create({
      data: {
        contractorId,
        city: values.city,
        pageName: values.pageName,
        pageUrl,
        editUrl,
        seoTitle: values.seoTitle,
        focusKeyphrase: values.focusKeyphrase,
        slug,
        metaDescription: values.metaDescription,
        relatedKeyphrases: text((body as Record<string, unknown>).relatedKeyphrases, 300),
        canonicalUrl,
        socialTitle: values.socialTitle,
        socialDescription: values.socialDescription,
        notes: text((body as Record<string, unknown>).notes, 4000) || null,
        status: 'submitted',
      },
    });

    await logAudit(user, {
      action: 'wordpress_work.submitted',
      method: 'POST',
      path: '/api/training/wordpress-work',
      entity: 'WordPressWorkSubmission',
      entityId: submission.id,
      metadata: { city: submission.city, slug: submission.slug, pageUrl: submission.pageUrl },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error('[wordpress-work] POST failed:', err);
    return NextResponse.json({ error: 'Failed to submit WordPress work' }, { status: 500 });
  }
}
