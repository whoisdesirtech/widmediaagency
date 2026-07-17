import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contractors = await prisma.contractor.findMany({
      include: { sows: true, _count: { select: { sows: true, assembledContracts: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalContractors = contractors.length;
    const activeContractors = contractors.filter(c => c.status === 'active').length;
    const totalSows = contractors.reduce((sum, c) => sum + c.sows.length, 0);
    const pendingContracts = await prisma.assembledContract.count({ where: { status: 'pending_signatures' } });

    return NextResponse.json({
      stats: { totalContractors, activeContractors, totalSows, pendingContracts },
      contractors: contractors.map(c => ({
        id: c.id,
        name: c.name,
        businessName: c.businessName,
        role: c.role,
        state: c.state,
        country: c.country,
        status: c.status,
        sowCount: c._count.sows,
        contractCount: c._count.assembledContracts,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
