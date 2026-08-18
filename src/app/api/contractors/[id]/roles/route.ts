import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth, isNextResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = [
  'photography',
  'videography',
  'social-media',
  'designer',
  'ai-automation',
  'developer',
  'copywriter',
  'motion-designer',
  'virtual-assistant',
  'marketing-specialist',
  'podcast-editor',
  'web-designer',
];

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const user = await requireAuth(['admin', 'staff', 'contractor']);
    if (isNextResponse(user)) return user;

    if (user.role === 'contractor' && user.contractorId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const roles = await prisma.contractorRole.findMany({
      where: { contractorId: id },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const user = await requireAuth(['contractor']);
    if (isNextResponse(user)) return user;

    if (user.contractorId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || typeof role !== 'string') {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}` }, { status: 400 });
    }

    const existing = await prisma.contractorRole.findUnique({
      where: { contractorId_role: { contractorId: id, role } },
    });

    if (existing) {
      return NextResponse.json({ error: 'You already have this role (approved or pending)' }, { status: 409 });
    }

    const contractorRole = await prisma.contractorRole.create({
      data: {
        contractorId: id,
        role,
        status: 'pending',
      },
    });

    return NextResponse.json(contractorRole, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
