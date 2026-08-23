'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/developer', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    label: 'Projects & Tasks',
    items: [
      { href: '/developer/projects', label: 'All Projects', icon: '🚀' },
      { href: '/developer/tasks', label: 'Tasks', icon: '✅' },
      { href: '/developer/portfolio', label: 'Developer Portfolio', icon: '📁' },
    ],
  },
  {
    label: 'Influencer Audits',
    items: [
      { href: '/developer/influencers', label: 'Influencers', icon: '👤' },
      { href: '/developer/audits', label: 'Active Audits', icon: '📊' },
      { href: '/developer/audit-agent', label: 'Audit Agent', icon: '🤖' },
      { href: '/developer/audits/portfolio', label: 'Audit Portfolio', icon: '🏆' },
    ],
  },
  {
    label: 'Brand Kits',
    items: [
      { href: '/developer/brand-kits', label: 'All Brand Kits', icon: '🎨' },
    ],
  },
];

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-40 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link href="/developer" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm">W</div>
            <div>
              <div className="font-heading font-bold text-sm text-gray-900">WhoIsDésir®</div>
              <div className="text-[0.65rem] text-gray-500">Developer Portal</div>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups[group.label];
            const hasActive = group.items.some(item => pathname === item.href || (item.href !== '/developer' && pathname.startsWith(item.href)));
            
            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full text-[0.65rem] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2 hover:text-gray-600"
                >
                  <span>{group.label}</span>
                  <span className={`text-[0.5rem] transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/developer' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link href="/dashboard" className="sidebar-link text-gray-500">
            <span className="text-lg">←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
