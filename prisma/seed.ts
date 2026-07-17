import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const agency = await prisma.agency.create({
    data: {
      name: 'WhoIsDésir® Media',
      homeJurisdiction: 'Florida, United States',
      communicationTools: JSON.stringify(['Slack', 'Email', 'ClickUp']),
      responseTimeDefault: '24 business hours',
      urgentResponseTime: '2-4 hours',
    },
  });

  const passwordHash = await bcrypt.hash('password', 10);

  await prisma.user.create({
    data: {
      email: 'admin@whodesir.com',
      passwordHash,
      name: 'Désir Jean-Fils',
      role: 'admin',
      agencyId: agency.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'staff@whodesir.com',
      passwordHash,
      name: 'Agency Staff',
      role: 'staff',
      agencyId: agency.id,
    },
  });

  const { FIXED_CLAUSES, ADDED_CLAUSES } = await import('../src/data/clauses.js');

  await prisma.masterAgreement.create({
    data: {
      agencyId: agency.id,
      clauses: JSON.stringify([...FIXED_CLAUSES, ...ADDED_CLAUSES]),
      version: 1,
    },
  });

  const { ADDENDUM_TEMPLATES } = await import('../src/data/addenda.js');

  for (const template of ADDENDUM_TEMPLATES) {
    await prisma.addendum.create({
      data: {
        roleType: template.roleType,
        title: template.title,
        fields: JSON.stringify(template.fields),
      },
    });
  }

  await prisma.contractor.create({
    data: {
      name: 'Aset Visions',
      businessName: 'Aset Visions LLC',
      role: 'photography',
      state: 'Florida',
      country: 'United States',
      status: 'active',
      agencyId: agency.id,
    },
  });

  console.log('✓ Agency created: WhoIsDésir® Media');
  console.log('✓ Users created (admin@whodesir.com / password)');
  console.log('✓ Master agreement created with all clauses');
  console.log('✓ Addenda templates saved');
  console.log('✓ First vendor added: Aset Visions (Photography, Florida)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
