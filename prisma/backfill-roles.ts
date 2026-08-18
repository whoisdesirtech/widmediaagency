import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const contractors = await prisma.contractor.findMany({
    select: { id: true, role: true, createdAt: true },
  });

  const data = contractors.map((c) => ({
    contractorId: c.id,
    role: c.role,
    status: 'approved',
    approvedAt: c.createdAt ?? new Date(),
  }));

  const result = await prisma.contractorRole.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Backfill complete — ${result.count} ContractorRole records created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
