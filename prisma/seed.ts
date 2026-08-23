import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Agency (find-or-create by name) ──
  let agency = await prisma.agency.findFirst({ where: { name: 'WhoIsDésir® Media' } });
  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        name: 'WhoIsDésir® Media',
        homeJurisdiction: 'Florida, United States',
        communicationTools: JSON.stringify(['Slack', 'Email', 'ClickUp']),
        responseTimeDefault: '24 business hours',
        urgentResponseTime: '2-4 hours',
      },
    });
  }

  const passwordHash = await bcrypt.hash('password', 10);

  // ── Users (upsert by unique email) ──
  await prisma.user.upsert({
    where: { email: 'admin@whodesir.com' },
    update: { agencyId: agency.id },
    create: {
      email: 'admin@whodesir.com',
      passwordHash,
      name: 'Désir Jean-Fils',
      role: 'admin',
      agencyId: agency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@whodesir.com' },
    update: { agencyId: agency.id },
    create: {
      email: 'staff@whodesir.com',
      passwordHash,
      name: 'Agency Staff',
      role: 'staff',
      agencyId: agency.id,
    },
  });

  // ── Master Agreement (find-or-create by agencyId + version) ──
  const { FIXED_CLAUSES, ADDED_CLAUSES } = await import('../src/data/clauses.js');

  const clausesJson = JSON.stringify([...FIXED_CLAUSES, ...ADDED_CLAUSES]);
  let masterAgreement = await prisma.masterAgreement.findFirst({
    where: { agencyId: agency.id, version: 1 },
  });
  if (!masterAgreement) {
    masterAgreement = await prisma.masterAgreement.create({
      data: {
        agencyId: agency.id,
        clauses: clausesJson,
        version: 1,
      },
    });
  }

  // ── Addenda (find-or-create by roleType + title) ──
  const { ADDENDUM_TEMPLATES } = await import('../src/data/addenda.js');

  for (const template of ADDENDUM_TEMPLATES) {
    const existing = await prisma.addendum.findFirst({
      where: { roleType: template.roleType, title: template.title },
    });
    if (!existing) {
      await prisma.addendum.create({
        data: {
          roleType: template.roleType,
          title: template.title,
          fields: JSON.stringify(template.fields),
        },
      });
    }
  }

  // ── Contractor (find-or-create by name + agencyId) ──
  let contractor = await prisma.contractor.findFirst({
    where: { name: 'Aset Visions', agencyId: agency.id },
  });
  if (!contractor) {
    contractor = await prisma.contractor.create({
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
  }

  // ── Demo Client (upsert by unique email) ──
  let demoClient = await prisma.client.upsert({
    where: { email: 'demo@example.com' },
    update: { agencyId: agency.id },
    create: {
      name: 'Demo Client',
      businessName: 'Demo Client Co.',
      email: 'demo@example.com',
      status: 'active',
      agencyId: agency.id,
    },
  });

  // ── Demo Projects (find-or-create by name + clientId) ──
  let project1 = await prisma.project.findFirst({
    where: { name: 'Agency Website Redesign', clientId: demoClient.id },
  });
  if (!project1) {
    project1 = await prisma.project.create({
      data: {
        clientId: demoClient.id,
        name: 'Agency Website Redesign',
        description: 'Complete redesign of the WhoIsDésir Media Agency website with modern UI/UX',
        icon: '🌐',
        status: 'complete',
        progress: 100,
        timeline: JSON.stringify([
          { label: 'Discovery', done: true },
          { label: 'Design', done: true },
          { label: 'Development', done: true },
          { label: 'Review', done: true },
          { label: 'Launch', done: true },
        ]),
        deliverables: 3,
        sortOrder: 1,
      },
    });
  }

  let project2 = await prisma.project.findFirst({
    where: { name: 'Influencer Audit Agent', clientId: demoClient.id },
  });
  if (!project2) {
    project2 = await prisma.project.create({
      data: {
        clientId: demoClient.id,
        name: 'Influencer Audit Agent',
        description: 'AI-powered system for analyzing and scoring influencer profiles',
        icon: '🤖',
        status: 'complete',
        progress: 100,
        timeline: JSON.stringify([
          { label: 'Discovery', done: true },
          { label: 'Design', done: true },
          { label: 'Development', done: true },
          { label: 'Review', done: true },
          { label: 'Launch', done: true },
        ]),
        deliverables: 2,
        sortOrder: 2,
      },
    });
  }

  // ── Demo Portfolio Items (find-or-create by title + isDemo) ──
  let portfolioItem1 = await prisma.portfolioItem.findFirst({
    where: { title: 'Agency Website Redesign', isDemo: true },
  });
  if (!portfolioItem1) {
    portfolioItem1 = await prisma.portfolioItem.create({
      data: {
        title: 'Agency Website Redesign',
        description: 'Complete redesign of the WhoIsDésir Media Agency website with modern UI/UX',
        category: 'web-development',
        status: 'completed',
        priority: 'high',
        technologies: JSON.stringify(['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma']),
        skillsDemonstrated: JSON.stringify(['Full-stack Development', 'UI/UX Design', 'Database Design']),
        deliverables: JSON.stringify(['Responsive Website', 'Admin Dashboard', 'API Routes']),
        completionPercent: 100,
        isDemo: true,
      },
    });
  }

  let portfolioItem2 = await prisma.portfolioItem.findFirst({
    where: { title: 'Influencer Audit Agent', isDemo: true },
  });
  if (!portfolioItem2) {
    portfolioItem2 = await prisma.portfolioItem.create({
      data: {
        title: 'Influencer Audit Agent',
        description: 'AI-powered system for analyzing and scoring influencer profiles',
        category: 'ai-agent',
        status: 'completed',
        priority: 'high',
        technologies: JSON.stringify(['Next.js', 'OpenAI', 'Prisma']),
        skillsDemonstrated: JSON.stringify(['AI Integration', 'Data Analysis', 'API Design']),
        deliverables: JSON.stringify(['Audit Scoring System', 'Brand Kit Generator']),
        completionPercent: 100,
        isDemo: true,
      },
    });
  }

  // ── Demo Tasks (find-or-create by title + projectId) ──
  // Task.projectId MUST reference Project.id, NOT PortfolioItem.id
  const existingTask1 = await prisma.portalTask.findFirst({
    where: { title: 'Create Brand Kit Template', projectId: project1.id },
  });
  if (!existingTask1) {
    await prisma.portalTask.create({
      data: {
        title: 'Create Brand Kit Template',
        description: 'Design and implement the reusable Social Media Brand Kit template',
        status: 'completed',
        priority: 'high',
        projectId: project1.id,
        estimatedEffort: '8h',
        actualEffort: '6h',
        deliverable: 'Brand Kit Template Component',
      },
    });
  }

  const existingTask2 = await prisma.portalTask.findFirst({
    where: { title: 'Build Audit Scoring Logic', projectId: project2.id },
  });
  if (!existingTask2) {
    await prisma.portalTask.create({
      data: {
        title: 'Build Audit Scoring Logic',
        description: 'Implement the weighted scoring system for influencer audits',
        status: 'completed',
        priority: 'high',
        projectId: project2.id,
        estimatedEffort: '12h',
        actualEffort: '10h',
        deliverable: 'Scoring Algorithm',
      },
    });
  }

  // ── Demo Influencer (find-or-create by name + username) ──
  let influencer1 = await prisma.influencer.findFirst({
    where: { name: 'Sarah Lifestyle', username: 'sarahifestyle' },
  });
  if (!influencer1) {
    influencer1 = await prisma.influencer.create({
      data: {
        name: 'Sarah Lifestyle',
        creatorName: 'Sarah Johnson',
        platform: 'instagram',
        username: 'sarahifestyle',
        profileUrl: 'https://instagram.com/sarahifestyle',
        niche: 'Lifestyle & Fashion',
        audienceDescription: 'Young women aged 18-34 interested in fashion, travel, and lifestyle content',
        followerCount: 125000,
        engagementRate: 4.2,
        contentCategories: JSON.stringify(['Fashion', 'Travel', 'Lifestyle', 'Beauty']),
        postingFrequency: 'Daily',
        status: 'brand-kit-completed',
        isDemo: true,
      },
    });
  }

  // ── Demo Influencer 2 (find-or-create) ──
  let influencer2 = await prisma.influencer.findFirst({
    where: { name: 'TechBro Marcus', username: 'techbro_marcus' },
  });
  if (!influencer2) {
    influencer2 = await prisma.influencer.create({
      data: {
        name: 'TechBro Marcus',
        creatorName: 'Marcus Williams',
        platform: 'youtube',
        username: 'techbro_marcus',
        profileUrl: 'https://youtube.com/@techbro_marcus',
        niche: 'Technology & Gadgets',
        audienceDescription: 'Tech enthusiasts aged 20-40 interested in gadgets, software reviews, and tutorials',
        followerCount: 85000,
        engagementRate: 3.1,
        contentCategories: JSON.stringify(['Tech Reviews', 'Tutorials', 'Gadgets', 'Software']),
        postingFrequency: '3x per week',
        status: 'in-audit',
        isDemo: true,
      },
    });
  }

  // ── Demo Audit (find-or-create by influencerId + isDemo) ──
  let audit1 = await prisma.influencerAudit.findFirst({
    where: { influencerId: influencer1.id, isDemo: true },
  });
  if (!audit1) {
    audit1 = await prisma.influencerAudit.create({
      data: {
        influencerId: influencer1.id,
        status: 'approved',
        overallScore: 78,
        profileOptimizationScore: 85,
        brandIdentityScore: 72,
        contentQualityScore: 80,
        contentConsistencyScore: 75,
        audienceAlignmentScore: 82,
        engagementScore: 70,
        discoverabilityScore: 68,
        professionalReadinessScore: 88,
        brandPartnershipReadinessScore: 76,
        findings: JSON.stringify([
          'Strong visual consistency across posts',
          'Bio could benefit from clearer value proposition',
          'High engagement rate indicates loyal audience',
          'Content mix is well-balanced between lifestyle categories'
        ]),
        recommendations: JSON.stringify([
          'Update bio with clear niche statement',
          'Add branded highlight covers',
          'Develop consistent color palette for feed',
          'Create content pillars for better organization'
        ]),
        aiGenerated: true,
        aiModel: 'gpt-4',
        isDemo: true,
      },
    });
  }

  // ── Demo Brand Kit (find-or-create by influencerId + name) ──
  let brandKit1 = await prisma.brandKit.findFirst({
    where: { influencerId: influencer1.id, name: 'Sarah Lifestyle Brand Identity' },
  });
  if (!brandKit1) {
    brandKit1 = await prisma.brandKit.create({
      data: {
        influencerId: influencer1.id,
        name: 'Sarah Lifestyle Brand Identity',
        tagline: 'Living Beautifully, One Day at a Time',
        mission: 'To inspire young women to embrace their unique style and live authentically',
        positioning: 'Premium lifestyle content creator with authentic voice',
        niche: 'Lifestyle & Fashion',
        targetAudience: 'Women 18-34 interested in fashion, travel, and aspirational lifestyle',
        brandPersonality: 'Warm, Authentic, Stylish, Approachable, Inspiring',
        primaryColor: '#E91E63',
        secondaryColor: '#F8BBD0',
        accentColor: '#9C27B0',
        backgroundColor: '#FFFFFF',
        textColor: '#212121',
        headingFont: 'Playfair Display',
        bodyFont: 'Montserrat',
        voice: 'Warm and conversational, like talking to a stylish friend',
        tone: 'Positive, uplifting, and authentic',
        status: 'approved',
        completionPercent: 85,
        isDemo: true,
      },
    });
  }

  // ── Brand Kit Sections (find-or-create by brandKitId + sectionType) ──
  const sectionData = [
    {
      sectionType: 'brand-identity',
      title: 'Brand Identity',
      content: JSON.stringify({
        creatorName: 'Sarah Johnson',
        brandName: 'Sarah Lifestyle',
        tagline: 'Living Beautifully, One Day at a Time',
        mission: 'To inspire young women to embrace their unique style and live authentically',
      }),
      sortOrder: 1,
    },
    {
      sectionType: 'visual-identity',
      title: 'Visual Identity',
      content: JSON.stringify({
        primaryColor: '#E91E63',
        secondaryColor: '#F8BBD0',
        accentColor: '#9C27B0',
        headingFont: 'Playfair Display',
        bodyFont: 'Montserrat',
      }),
      sortOrder: 2,
    },
    {
      sectionType: 'content-pillars',
      title: 'Content Pillars',
      content: JSON.stringify([
        { name: 'Fashion', description: 'Outfit inspiration and style tips' },
        { name: 'Travel', description: 'Destinations and travel guides' },
        { name: 'Lifestyle', description: 'Daily routines and wellness' },
      ]),
      sortOrder: 3,
    },
  ];

  for (const section of sectionData) {
    const existing = await prisma.brandKitSection.findFirst({
      where: { brandKitId: brandKit1.id, sectionType: section.sectionType },
    });
    if (!existing) {
      await prisma.brandKitSection.create({
        data: { ...section, brandKitId: brandKit1.id, isCompleted: true },
      });
    }
  }

  console.log('✓ Agency ready: WhoIsDésir® Media');
  console.log('✓ Users ready (admin@whodesir.com / password)');
  console.log('✓ Master agreement ready');
  console.log('✓ Addenda templates ready');
  console.log('✓ Contractor ready: Aset Visions');
  console.log('✓ Demo client ready: Demo Client Co.');
  console.log('✓ Demo projects ready (2)');
  console.log('✓ Demo portfolio items ready (2)');
  console.log('✓ Demo tasks ready (2)');
  console.log('✓ Demo influencer ready: Sarah Lifestyle');
  console.log('✓ Demo influencer ready: TechBro Marcus');
  console.log('✓ Demo audit ready with scores');
  console.log('✓ Demo brand kit ready with sections');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
