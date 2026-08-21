import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pw = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) pw += chars[bytes[i] % chars.length];
  return pw;
}

async function main() {
  const name = 'Felipe Cisternas';
  const email = 'fcisternasc@gmail.com';
  const businessName = 'Felipe Cisternas';
  const role = 'developer';
  const state = 'Florida';
  const country = 'United States';

  // Find the agency
  const agency = await prisma.agency.findFirst();
  if (!agency) {
    console.error('No agency found. Run seed first.');
    process.exit(1);
  }

  // Check if contractor already exists
  const existing = await prisma.contractor.findFirst({ where: { name } });
  if (existing) {
    console.log(`Contractor "${name}" already exists (id: ${existing.id})`);
    if (existing.userId) {
      console.log('User account already linked.');
    } else {
      console.log('No user account linked yet. Generate login via admin UI.');
    }
    process.exit(0);
  }

  // Generate password
  const tempPw = generatePassword();
  const hash = await bcrypt.hash(tempPw, 10);

  // Create User
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hash,
      role: 'contractor',
      agencyId: agency.id,
    },
  });

  // Create Contractor
  const contractor = await prisma.contractor.create({
    data: {
      name,
      businessName,
      role,
      state,
      country,
      status: 'active',
      agencyId: agency.id,
      userId: user.id,
    },
  });

  // Link user to contractor
  await prisma.user.update({
    where: { id: user.id },
    data: { contractorId: contractor.id },
  });

  console.log('\n========================================');
  console.log('  CONTRACTOR CREATED SUCCESSFULLY');
  console.log('========================================');
  console.log(`  Name:     ${name}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${tempPw}`);
  console.log(`  Role:     contractor`);
  console.log(`  Status:   active`);
  console.log(`  User ID:  ${user.id}`);
  console.log(`  Contractor ID: ${contractor.id}`);
  console.log('========================================\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
