import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test data...');

  const agency = await prisma.agency.findFirst();
  if (!agency) { console.error('No agency found. Run db:seed first.'); return; }

  // Create a test client
  const client = await prisma.client.upsert({
    where: { id: 'test-client-001' },
    update: {},
    create: {
      id: 'test-client-001',
      name: 'Test Client Corp',
      email: 'client@test.com',
      phone: '555-0100',
      businessName: 'Test Client Corp',
      status: 'active',
      agencyId: agency.id,
    },
  });
  console.log(`✓ Client: ${client.name} (${client.id})`);

  // Create a multi-role contractor (developer + photographer)
  const contractor = await prisma.contractor.upsert({
    where: { id: 'test-contractor-001' },
    update: {},
    create: {
      id: 'test-contractor-001',
      name: 'Test Developer',
      businessName: 'Test Dev Studio LLC',
      role: 'developer',
      state: 'Florida',
      country: 'United States',
      status: 'active',
      agencyId: agency.id,
    },
  });
  console.log(`✓ Contractor: ${contractor.name} (${contractor.id})`);

  // Create ContractorRole records (multi-role)
  await prisma.contractorRole.upsert({
    where: { contractorId_role: { contractorId: contractor.id, role: 'developer' } },
    update: {},
    create: {
      contractorId: contractor.id,
      role: 'developer',
      status: 'approved',
      approvedAt: new Date(),
    },
  });

  await prisma.contractorRole.upsert({
    where: { contractorId_role: { contractorId: contractor.id, role: 'photography' } },
    update: {},
    create: {
      contractorId: contractor.id,
      role: 'photography',
      status: 'approved',
      approvedAt: new Date(),
    },
  });

  await prisma.contractorRole.upsert({
    where: { contractorId_role: { contractorId: contractor.id, role: 'videography' } },
    update: {},
    create: {
      contractorId: contractor.id,
      role: 'videography',
      status: 'pending',
    },
  });
  console.log('✓ ContractorRoles: developer (approved), photography (approved), videography (pending)');

  // Create a project
  const project = await prisma.project.upsert({
    where: { id: 'test-project-001' },
    update: {},
    create: {
      id: 'test-project-001',
      clientId: client.id,
      contractorId: contractor.id,
      name: 'Brand Website Redesign',
      description: 'Complete website redesign with new branding and photography',
      status: 'active',
      progress: 35,
    },
  });
  console.log(`✓ Project: ${project.name} (${project.id})`);

  // Create a SOW
  const sow = await prisma.sOW.upsert({
    where: { id: 'test-sow-001' },
    update: {},
    create: {
      id: 'test-sow-001',
      contractorId: contractor.id,
      rate: 85,
      rateType: 'hourly',
      paymentSchedule: 'biweekly',
      startDate: '2026-08-01',
      endDate: '2026-12-31',
      specialEquipment: '',
      software: 'Figma, VS Code, Next.js',
      deliverables: JSON.stringify([
        { text: 'Design system and component library', status: 'approved' },
        { text: 'Responsive website (5 pages)', status: 'pending' },
        { text: 'Brand photography (20 images)', status: 'pending' },
        { text: 'Social media content kit', status: 'pending' },
      ]),
      status: 'active',
    },
  });
  console.log(`✓ SOW: $${sow.rate}/${sow.rateType} (${sow.id})`);

  // Create deliverables linked to the SOW
  const deliverables = [
    { name: 'Design System & Component Library', type: 'design', status: 'approved', sowId: sow.id, sortOrder: 1 },
    { name: 'Homepage Hero Image', type: 'image', status: 'pending-approval', sowId: sow.id, sortOrder: 2 },
    { name: 'About Us Page Copy', type: 'document', status: 'approved', sowId: sow.id, sortOrder: 3 },
    { name: 'Brand Portrait Set (10 photos)', type: 'image', status: 'in-progress', sowId: sow.id, sortOrder: 4 },
    { name: 'Instagram Reel — Product Launch', type: 'video', status: 'pending', sowId: sow.id, sortOrder: 5 },
    { name: 'Logo Concepts (3 options)', type: 'design', status: 'changes-requested', sowId: sow.id, sortOrder: 6 },
    { name: 'Website Mockup — Mobile', type: 'design', status: 'approved', sowId: sow.id, sortOrder: 7 },
    { name: 'Social Media Content Calendar', type: 'document', status: 'approved', sowId: sow.id, sortOrder: 8 },
  ];

  for (const d of deliverables) {
    await prisma.deliverable.upsert({
      where: { id: `test-del-${d.sortOrder}` },
      update: {},
      create: {
        id: `test-del-${d.sortOrder}`,
        clientId: client.id,
        projectId: project.id,
        contractorId: contractor.id,
        sowId: d.sowId,
        name: d.name,
        type: d.type,
        status: d.status,
        description: `Test deliverable for ${project.name}`,
        sortOrder: d.sortOrder,
        approvedAt: d.status === 'approved' ? new Date() : null,
      },
    });
  }
  console.log(`✓ Deliverables: ${deliverables.length} created (mixed statuses)`);

  // Create a test user for the contractor
  const passwordHash = await bcrypt.hash('test1234', 10);

  const contractorUser = await prisma.user.upsert({
    where: { id: 'test-user-contractor-001' },
    update: { contractorId: contractor.id },
    create: {
      id: 'test-user-contractor-001',
      email: 'developer@test.com',
      passwordHash,
      name: 'Test Developer',
      role: 'contractor',
      agencyId: agency.id,
      contractorId: contractor.id,
    },
  });

  // Link contractor → user (mirrors POST /api/contractors/[id]/login)
  await prisma.contractor.update({
    where: { id: contractor.id },
    data: { userId: contractorUser.id },
  });

  // Create a test user for the client
  await prisma.user.upsert({
    where: { id: 'test-user-client-001' },
    update: {},
    create: {
      id: 'test-user-client-001',
      email: 'client@test.com',
      passwordHash,
      name: 'Test Client',
      role: 'client',
      agencyId: agency.id,
    },
  });
  console.log('✓ Test users: developer@test.com / test1234, client@test.com / test1234');

  console.log('\n--- Test Data Summary ---');
  console.log('Client:      Test Client Corp (test-client-001)');
  console.log('Contractor:  Test Developer — developer + photography (approved), videography (pending)');
  console.log('Project:     Brand Website Redesign');
  console.log('SOW:         $85/hr, active');
  console.log('Deliverables: 8 items (mixed statuses)');
  console.log('Login as contractor: developer@test.com / test1234');
  console.log('Login as client:     client@test.com / test1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
