'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const TABS = [
  { label: 'Overview', href: '', icon: '🏢' },
  { label: 'Projects', href: '/projects', icon: '📁' },
  { label: 'Deliverables', href: '/deliverables', icon: '📋' },
  { label: 'Media Gallery', href: '/media', icon: '🖼️' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Billing', href: '/billing', icon: '💰' },
  { label: 'Documents', href: '/documents', icon: '📄' },
  { label: 'Folders', href: '/folders', icon: '📂' },
];

export default function AdminClientMessagesPage() {
  const params = useParams();
  const id = params?.id as string;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(data => { setClient(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-muted mb-2">
              <Link href="/clients" className="hover:text-dark-800">Clients</Link>
              <span>→</span>
              <Link href={`/clients/${id}`} className="hover:text-dark-800">{client?.name}</Link>
              <span>→</span>
              <span className="text-dark-800">Messages</span>
            </div>
            <h1 className="font-heading text-2xl font-black text-dark-800">Messages</h1>
            <p className="text-muted text-sm mt-1">View and respond to {client?.name}&apos;s messages</p>
          </div>

          <div className="flex gap-1 mb-8 border-b border-muted-lighter overflow-x-auto">
            {TABS.map((tab) => {
              const href = `/clients/${id}${tab.href}`;
              const isActive = tab.href === '/messages';
              return (
                <Link key={tab.label} href={href} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${isActive ? 'text-miami-pink border-miami-pink' : 'text-muted border-transparent hover:text-dark-800 hover:border-muted-lighter'}`}>
                  <span>{tab.icon}</span>{tab.label}
                </Link>
              );
            })}
          </div>

          <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
            <div className="flex h-full">
              <div className="w-80 border-r border-muted-lighter flex flex-col">
                <div className="p-4 border-b border-muted-lighter">
                  <h3 className="font-heading font-bold text-dark-800 text-sm">Conversations</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-8 text-center text-muted text-sm">
                    <div className="text-3xl mb-2">💬</div>
                    <p>Messages will appear here once the client sends them.</p>
                    <p className="text-xs mt-2">The client portal has a built-in chat system.</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-muted text-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3">📨</div>
                  <p>Select a conversation to view messages</p>
                  <p className="text-xs mt-1">Messages from the client portal will sync here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
