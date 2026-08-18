'use client';

import React, { useEffect, useState } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
  clientId?: string;
  contractorRoles?: string[];
}

interface ContractorRole {
  id: string;
  contractorId: string;
  role: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
}

const AVAILABLE_ROLES = [
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'videography', label: 'Videography', icon: '🎬' },
  { value: 'social-media', label: 'Social Media Manager', icon: '📱' },
  { value: 'designer', label: 'Graphic Designer', icon: '🎨' },
  { value: 'ai-automation', label: 'AI Automation Specialist', icon: '🤖' },
  { value: 'web-designer', label: 'Web Designer', icon: '🌐' },
  { value: 'developer', label: 'Developer', icon: '💻' },
  { value: 'copywriter', label: 'Copywriter', icon: '✍️' },
  { value: 'motion-designer', label: 'Motion Designer', icon: '✨' },
  { value: 'virtual-assistant', label: 'Virtual Assistant', icon: '🗓️' },
  { value: 'marketing-specialist', label: 'Marketing Specialist', icon: '📈' },
  { value: 'podcast-editor', label: 'Podcast Editor', icon: '🎙️' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  approved: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

const ROLE_ICONS: Record<string, string> = {
  photography: '📸', videography: '🎬', 'social-media': '📱',
  designer: '🎨', 'ai-automation': '🤖', 'web-designer': '🌐',
  developer: '💻', copywriter: '✍️', 'motion-designer': '✨',
  'virtual-assistant': '🗓️', 'marketing-specialist': '📈', 'podcast-editor': '🎙️',
};

export default function MyRolesPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [roles, setRoles] = useState<ContractorRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.contractorId) {
      fetchRoles(u.contractorId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRoles = async (contractorId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contractors/${contractorId}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  };

  const handleRequestRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !user?.contractorId) return;

    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const res = await fetch(`/api/contractors/${user.contractorId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.ok) {
        setSubmitMsg({ type: 'success', text: 'Role requested successfully! It will appear as pending until approved by an admin.' });
        setSelectedRole('');
        await fetchRoles(user.contractorId);
      } else {
        const data = await res.json();
        setSubmitMsg({ type: 'error', text: data.error || 'Failed to request role.' });
      }
    } catch {
      setSubmitMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
    }

    setSubmitting(false);
  };

  const requestedRoles = new Set(roles.map(r => r.role));
  const availableToRequest = AVAILABLE_ROLES.filter(r => !requestedRoles.has(r.value));

  const approvedRoles = roles.filter(r => r.status === 'approved');
  const pendingRoles = roles.filter(r => r.status === 'pending');
  const rejectedRoles = roles.filter(r => r.status === 'rejected');

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">My Roles</h1>
            <p className="text-muted text-sm mt-1">View your assigned roles and request new ones</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Approved</div>
                  <div className="font-heading text-3xl font-black text-dark-800">{approvedRoles.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg">✅</div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Pending</div>
                  <div className="font-heading text-3xl font-black text-dark-800">{pendingRoles.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg">⏳</div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-muted text-xs font-semibold mb-1">Rejected</div>
                  <div className="font-heading text-3xl font-black text-dark-800">{rejectedRoles.length}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg">❌</div>
              </div>
            </div>
          </div>

          {roles.length === 0 && !loading && (
            <div className="glass-card p-12 text-center mb-8">
              <div className="text-4xl mb-3">🏷️</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Roles Yet</div>
              <div className="text-muted text-sm">You don&apos;t have any approved roles yet. Request a role below to get started.</div>
            </div>
          )}

          {roles.length > 0 && (
            <div className="space-y-3 mb-8">
              {roles.map((cr) => {
                const status = STATUS_CONFIG[cr.status] || STATUS_CONFIG.pending;
                const roleInfo = AVAILABLE_ROLES.find(r => r.value === cr.role);
                return (
                  <div key={cr.id} className="glass-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-lg">
                          {roleInfo?.icon || ROLE_ICONS[cr.role] || '📋'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark-800 text-sm">
                            {roleInfo?.label || cr.role.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </h4>
                          <p className="text-xs text-muted">
                            Requested {new Date(cr.requestedAt).toLocaleDateString()}
                            {cr.reviewedAt && ` · Reviewed ${new Date(cr.reviewedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.border} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    {cr.status === 'pending' && (
                      <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                        ⏳ Awaiting admin approval. You&apos;ll be able to take on this role once approved.
                      </div>
                    )}
                    {cr.status === 'rejected' && (
                      <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                        ❌ This role request was not approved. Contact your admin for more information.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {availableToRequest.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Request New Role</h3>
              <form onSubmit={handleRequestRole} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="role-select" className="text-xs font-semibold text-muted mb-1 block">Select a role</label>
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-muted-lighter rounded-xl text-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-miami-blue-light focus:border-transparent"
                  >
                    <option value="">Choose a role...</option>
                    {availableToRequest.map(r => (
                      <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
                    ))}
                  </select>
                </div>

                {submitMsg && (
                  <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    submitMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {submitMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedRole || submitting}
                  className="btn-primary justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Requesting...' : 'Request Role →'}
                </button>
              </form>
            </div>
          )}

          {availableToRequest.length === 0 && roles.length > 0 && (
            <div className="glass-card p-6 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="font-heading font-bold text-dark-800 text-sm mb-1">All Roles Requested</div>
              <div className="text-muted text-xs">You&apos;ve requested all available roles. Check back later for new role types.</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
