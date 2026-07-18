'use client';

import ContractorSidebar from '@/components/ContractorSidebar';
import HtmlRenderer from '@/components/HtmlRenderer';
import { useEffect, useState } from 'react';

export default function ContractorTrainingPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} />
      <main className="ml-64 flex-1">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-dark mb-1">Training &amp; Guides</h1>
            <p className="text-sm text-muted">Your onboarding guide, portal walkthrough, and vendor phases</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">1</span>
                Your Contractor Guide
              </h2>
              <div className="rounded-2xl overflow-hidden border border-muted-lighter bg-white">
                <HtmlRenderer src="/contractor-guide.html" />
              </div>
            </section>

            <section>
              <h2 className="font-heading text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">2</span>
                Vendor Onboarding &amp; Payment Phases
              </h2>
              <div className="rounded-2xl overflow-hidden border border-muted-lighter bg-white">
                <HtmlRenderer src="/vendor-phases.html" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
