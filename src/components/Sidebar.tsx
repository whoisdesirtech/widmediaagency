'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/contractors', label: 'Contractors', icon: '👥' },
  { href: '/master-agreement', label: 'Master Agreement', icon: '📋' },
  { href: '/sow-builder', label: 'SOW Builder', icon: '📝' },
  { href: '/addenda', label: 'Addenda Library', icon: '📚' },
  { href: '/contracts', label: 'Assembled Contracts', icon: '📑' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/training', label: 'Training', icon: '📖' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark flex flex-col z-50">
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <div>
            <div className="font-heading font-bold text-white text-sm leading-tight">WhoIsDésir® Media</div>
            <div className="text-[0.7rem] text-white/40">Freelancer Agreement System</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
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
          <div className="w-8 h-8 rounded-full bg-miami-pink/20 flex items-center justify-center text-miami-pink text-xs font-bold">
            {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name || 'Agency Admin'}</div>
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
