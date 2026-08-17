'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/contractor/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/contractor/projects', label: 'Projects', icon: '📁' },
  { href: '/contractor/deliverables', label: 'Deliverables', icon: '📋' },
  { href: '/contractor/contracts', label: 'My Contracts', icon: '📑' },
  { href: '/contractor/onboarding', label: 'Onboarding', icon: '📄' },
  { href: '/contractor/training', label: 'Training', icon: '📖' },
];

const DEVELOPER_ITEMS = [
  { href: '/contractor/developer', label: 'Developer Workspace', icon: '💻' },
];

export default function ContractorSidebar({ user, contractorRole }: { user?: { name: string; email: string }; contractorRole?: string }) {
  const pathname = usePathname();
  const isDeveloper = contractorRole === 'developer';
  const allItems = isDeveloper ? [...NAV_ITEMS, ...DEVELOPER_ITEMS] : NAV_ITEMS;

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark flex flex-col z-50">
      <div className="p-6 border-b border-white/5">
        <Link href="/contractor/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <div>
            <div className="font-heading font-bold text-white text-sm leading-tight">WhoIsDésir® Media</div>
            <div className="text-[0.7rem] text-white/40">{isDeveloper ? 'Developer Portal' : 'Contractor Portal'}</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {allItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-miami-blue-light/20 flex items-center justify-center text-miami-blue-light text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase() || 'CT'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name || 'Contractor'}</div>
            <div className="text-white/40 text-[0.65rem] truncate">{user?.email || ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-center text-[0.7rem] text-white/40 hover:text-white/70 transition-colors py-1"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
