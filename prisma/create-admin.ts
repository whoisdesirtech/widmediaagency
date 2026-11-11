import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

if (!process.env.DATABASE_URL) {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      let value = m[2].trim();
      if (!value || value.startsWith('#')) continue;
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  } catch {
    // no .env — rely on the ambient environment
  }
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = crypto.randomBytes(length);
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[bytes[i] % chars.length];
  return pw;
}

async function main() {
  const email = 'admin@whoisdesir.com';
  const name = 'Désir Jean-Fils';
  const role = 'admin';

  const prisma = new PrismaClient();

  const rawPassword = generatePassword();
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const agency = await prisma.agency.findFirst();

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, name },
    create: { email, name, passwordHash, role, agencyId: agency?.id ?? null },
  });

  console.log('\n========================================');
  console.log(`  ${user.createdAt && Date.now() === new Date(user.createdAt).getTime() ? 'ADMIN CREATED' : 'ADMIN PASSWORD RESET'}`);
  console.log('========================================');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${rawPassword}`);
  console.log(`  Role:     ${role}`);
  console.log(`  Agency:   ${agency?.id ?? '(none) — agencyId is optional'}`);
  console.log(`  User ID:  ${user.id}`);
  console.log('========================================\n');

  await prisma.$disconnect();
}

main()
  .catch(async e => {
    console.error('ERROR:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
