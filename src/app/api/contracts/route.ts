import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FIXED_CLAUSES, ADDED_CLAUSES } from '@/data/clauses';

function buildMergedContent(masterClauses: any[], contractor: any, sow: any, addenda: any[]): string {
  let content = '';
  content += `FREELANCER TALENT AGREEMENT\n`;
  content += `WhoIsDésir® Media Agency × ${contractor.name}\n\n`;

  content += `CONTRACTOR INFORMATION\n`;
  content += `Name: ${contractor.name}\n`;
  content += `Business: ${contractor.businessName}\n`;
  content += `Role: ${contractor.role.replace(/-/g, ' ')}\n`;
  content += `Jurisdiction: ${contractor.state}, ${contractor.country}\n\n`;

  content += `MASTER AGREEMENT CLAUSES\n`;
  content += `${'='.repeat(40)}\n\n`;

  for (const clause of masterClauses) {
    content += `${clause.number}. ${clause.title}\n`;
    content += `${clause.content}\n\n`;
  }

  if (sow) {
    const deliverables = JSON.parse(sow.deliverables || '[]');
    content += `STATEMENT OF WORK\n`;
    content += `${'='.repeat(40)}\n\n`;
    content += `Rate: $${sow.rate} (${sow.rateType.replace(/-/g, ' ')})\n`;
    content += `Payment Schedule: ${sow.paymentSchedule}\n`;
    content += `Start Date: ${sow.startDate}\n`;
    if (sow.specialEquipment) content += `Special Equipment: ${sow.specialEquipment}\n`;
    if (sow.software) content += `Software: ${sow.software}\n`;
    content += `\nDeliverables:\n`;
    deliverables.forEach((d: string, i: number) => { content += `  ${i + 1}. ${d}\n`; });
    content += '\n';
  }

  if (addenda.length > 0) {
    content += `ROLE-SPECIFIC ADDENDA\n`;
    content += `${'='.repeat(40)}\n\n`;
    for (const addendum of addenda) {
      content += `## ${addendum.title}\n`;
      const fields = JSON.parse(addendum.fields || '[]');
      for (const field of fields) {
        content += `${field.label}: ${field.defaultValue || 'Not specified'}\n`;
      }
      content += '\n';
    }
  }

  content += `SIGNATURES\n`;
  content += `${'='.repeat(40)}\n\n`;
  content += `Agency Representative: _________________________ Date: __________\n\n`;
  content += `Contractor: _________________________ Date: __________\n`;

  return content;
}

export async function GET() {
  try {
    const contracts = await prisma.assembledContract.findMany({
      include: { contractor: true, master: true, sow: true, signatures: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(contracts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { contractorId, masterId, sowId, addendumIds } = await req.json();
    const contractor = await prisma.contractor.findUnique({ where: { id: contractorId } });
    if (!contractor) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    let master = await prisma.masterAgreement.findFirst({ where: { isActive: true } });
    if (!master) {
      let agency = await prisma.agency.findFirst();
      if (!agency) agency = await prisma.agency.create({ data: { name: 'WhoIsDésir® Media Agency' } });
      master = await prisma.masterAgreement.create({
        data: { agencyId: agency.id, clauses: JSON.stringify([...FIXED_CLAUSES, ...ADDED_CLAUSES]) },
      });
    }

    const contract = await prisma.assembledContract.create({
      data: {
        contractorId,
        masterId: masterId || master.id,
        sowId: sowId || null,
        addendumIds: JSON.stringify(addendumIds || []),
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
