'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import HtmlRenderer from '@/components/HtmlRenderer';

type Tab = 'guides' | 'contractor-linking' | 'quick-start';

const TABS: { key: Tab; label: string; description: string }[] = [
  { key: 'guides', label: 'Training Guides', description: 'Portal guides and training materials for all roles' },
  { key: 'contractor-linking', label: 'Contractor Linking', description: 'How to create a contractor and generate login credentials' },
  { key: 'quick-start', label: 'Quick Start', description: 'Get a contractor up and running in 5 minutes' },
];

export default function AdminTrainingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('guides');

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-white mb-1">Training &amp; Guides</h1>
                <p className="text-sm text-white/50">
                  Internal training materials, vendor onboarding, and contractor setup
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'gradient-bg text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab description */}
          <div className="mb-6 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
            <p className="text-sm text-white/60">
              {TABS.find(t => t.key === activeTab)?.description}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
            {activeTab === 'guides' && <TrainingGuides />}
            {activeTab === 'contractor-linking' && <ContractorLinking />}
            {activeTab === 'quick-start' && <QuickStart />}
          </div>
        </div>
      </main>
    </div>
  );
}

function TrainingGuides() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">1. Admin Portal Guide</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
          <HtmlRenderer src="/admin-training.html" />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">2. Google Drive Setup (Admin)</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
          <HtmlRenderer src="/admin-drive-setup.html" />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">3. Vendor Portal Guide</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
          <HtmlRenderer src="/vendor-training.html" />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">4. System Training Guide</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
          <HtmlRenderer src="/training-guide.html" />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">5. Vendor Onboarding &amp; Payment Phases</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
          <HtmlRenderer src="/vendor-phases.html" />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">6. Client Portal Guide</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
          <HtmlRenderer src="/client-training.html" />
        </div>
      </section>
    </div>
  );
}

function ContractorLinking() {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">How Contractor Login Works</h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
          <p className="text-sm text-white/60 mb-4">
            When you create a contractor in the admin panel, it only creates a <strong className="text-white/90">Contractor profile</strong> (business info, role, state). 
            To give them login access, you need to <strong className="text-white/90">generate credentials</strong>, which creates a User account linked to the Contractor.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-2">Contractor Profile</h3>
              <ul className="text-xs text-white/50 space-y-1">
                <li>• Business name, role, state</li>
                <li>• Tax forms, insurance, licensing</li>
                <li>• Google Drive folder</li>
                <li>• SOWs and contracts</li>
              </ul>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-2">User Account</h3>
              <ul className="text-xs text-white/50 space-y-1">
                <li>• Email + password login</li>
                <li>• Role: contractor</li>
                <li>• Linked via <code className="text-miami-pink">contractorId</code></li>
                <li>• Session carries contractor ID</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-step */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Step-by-Step: Create Contractor + Login</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">Create Contractor Profile</h3>
              <p className="text-xs text-white/50">Go to <strong className="text-white/70">Admin → Contractors</strong> → click <strong className="text-white/70">+ New Contractor</strong></p>
              <p className="text-xs text-white/40 mt-1">Fill in: Name, Business Name, Role, State, Country</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">Open Contractor Detail Page</h3>
              <p className="text-xs text-white/50">Click on the contractor&apos;s name to open their detail page</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">Generate Login Credentials</h3>
              <p className="text-xs text-white/50">Click <strong className="text-white/70">Create Login</strong> (or <strong className="text-white/70">Generate Credentials</strong>)</p>
              <p className="text-xs text-white/40 mt-1">This creates a User with <code className="text-miami-pink">role: contractor</code> and <code className="text-miami-pink">contractorId</code> linked to the Contractor</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-sm font-bold shrink-0">4</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">Share Credentials</h3>
              <p className="text-xs text-white/50">The system generates a temporary password. Share the email + password with the contractor.</p>
              <p className="text-xs text-white/40 mt-1">The contractor can then log in at <code className="text-miami-pink">/login</code></p>
            </div>
          </div>
        </div>
      </section>

      {/* What happens under the hood */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">What Happens Under the Hood</h2>
        <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto">
          <pre>{`// POST /api/contractors/[id]/login
// 1. Creates User record
const user = await prisma.user.create({
  data: {
    email,
    passwordHash: hashedPassword,
    name: contractor.name,
    role: 'contractor',
    contractorId: contractor.id,  // ← links User to Contractor
  },
});

// 2. Links Contractor back to User
await prisma.contractor.update({
  where: { id: contractor.id },
  data: { userId: user.id },  // ← links Contractor to User
});

// 3. Auto-assigns contractor-onboarding lesson`}</pre>
        </div>
      </section>

      {/* Common issues */}
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Common Issues</h2>
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-amber-300 mb-1">Contractor can&apos;t see tasks or deliverables</h3>
            <p className="text-xs text-amber-200/60">The User account has <code className="bg-white/5 px-1 rounded">contractorId: null</code>. Go to the contractor detail page and click &quot;Create Login&quot; to link them.</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-amber-300 mb-1">Contractor login goes to admin dashboard</h3>
            <p className="text-xs text-amber-200/60">The User&apos;s <code className="bg-white/5 px-1 rounded">role</code> is set to &quot;admin&quot; instead of &quot;contractor&quot;. Check the User record in the database.</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-amber-300 mb-1">Need to reset contractor password</h3>
            <p className="text-xs text-amber-200/60">Go to the contractor detail page → click &quot;Create Login&quot; again. It will generate a new password and send it to you.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickStart() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">5-Minute Contractor Setup</h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-sm text-white/80">Admin → Contractors → + New Contractor → fill form → Save</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-sm text-white/80">Click contractor name → click &quot;Create Login&quot; → copy email + password</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-sm text-white/80">Share credentials with contractor → they log in at /login</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold">4</span>
              <span className="text-sm text-white/80">Admin → Contractors → click contractor → approve roles → training auto-assigned</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-miami-pink/15 text-miami-pink flex items-center justify-center text-xs font-bold">5</span>
              <span className="text-sm text-white/80">Admin → Projects → create project → add tasks → assign to contractor</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-white mb-4">Test Accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/70">Role</th>
                <th className="text-left py-2 px-3 text-white/70">Email</th>
                <th className="text-left py-2 px-3 text-white/70">Password</th>
                <th className="text-left py-2 px-3 text-white/70">Status</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr className="border-b border-white/5">
                <td className="py-2 px-3 font-bold">Admin</td>
                <td className="py-2 px-3 font-mono text-xs">admin@whodesir.com</td>
                <td className="py-2 px-3 font-mono text-xs">DreamVibez$1111</td>
                <td className="py-2 px-3"><span className="text-emerald-400 text-xs">Active</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 px-3 font-bold">Test Developer</td>
                <td className="py-2 px-3 font-mono text-xs">developer@test.com</td>
                <td className="py-2 px-3 font-mono text-xs">test1234</td>
                <td className="py-2 px-3"><span className="text-amber-400 text-xs">No contractor linked</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 px-3 font-bold">Felipe Cisternas</td>
                <td className="py-2 px-3 font-mono text-xs">fcisternasc@gmail.com</td>
                <td className="py-2 px-3 font-mono text-xs">5L#pc#H$%2FD</td>
                <td className="py-2 px-3"><span className="text-emerald-400 text-xs">Active</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 px-3 font-bold">Wilmer Escobar</td>
                <td className="py-2 px-3 font-mono text-xs">Escobarwilmer665@gmail.com</td>
                <td className="py-2 px-3 font-mono text-xs">5wbP2pwMHpuw</td>
                <td className="py-2 px-3"><span className="text-emerald-400 text-xs">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
