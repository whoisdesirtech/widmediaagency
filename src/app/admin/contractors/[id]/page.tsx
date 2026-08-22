'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';

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

const ROLE_ICONS: Record<string, string> = {
  photography: '📸', videography: '🎬', 'social-media': '📱',
  designer: '🎨', 'ai-automation': '🤖', developer: '💻',
  copywriter: '✍️', 'web-designer': '🌐', 'motion-designer': '✨',
  'virtual-assistant': '🗓️', 'marketing-specialist': '📈', 'podcast-editor': '🎙️',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  approved: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function AdminContractorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [contractor, setContractor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState<any>(null);
  const [generatingLogin, setGeneratingLogin] = useState(false);
  const [contractorEmail, setContractorEmail] = useState('');
  const [resetResult, setResetResult] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [editingSow, setEditingSow] = useState<any>(null);
  const [editDeliverables, setEditDeliverables] = useState<string[]>([]);
  const [editRate, setEditRate] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [roles, setRoles] = useState<any[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showAddRole, setShowAddRole] = useState(false);
  const [roleAction, setRoleAction] = useState<string | null>(null);

  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [savingFolder, setSavingFolder] = useState(false);
  const [folderMessage, setFolderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/contractors/${id}`)
      .then(r => r.json())
      .then(data => { setContractor(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setRolesLoading(true);
    fetch(`/api/contractors/${id}/roles`)
      .then(r => r.json())
      .then(data => { setRoles(Array.isArray(data) ? data : []); setRolesLoading(false); })
      .catch(() => setRolesLoading(false));
  }, [id]);

  useEffect(() => {
    if (contractor?.googleDriveFolderUrl) setDriveFolderUrl(contractor.googleDriveFolderUrl);
  }, [contractor]);

  const handleSaveDriveFolder = async () => {
    setSavingFolder(true);
    setFolderMessage(null);
    try {
      const res = await fetch(`/api/contractors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleDriveFolderUrl: driveFolderUrl || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setContractor((c: any) => ({ ...c, googleDriveFolderId: updated.googleDriveFolderId, googleDriveFolderUrl: updated.googleDriveFolderUrl }));
        setFolderMessage({ type: 'success', text: driveFolderUrl ? 'Drive folder saved.' : 'Drive folder removed.' });
      } else {
        setFolderMessage({ type: 'error', text: 'Failed to save.' });
      }
    } catch {
      setFolderMessage({ type: 'error', text: 'Failed to save.' });
    }
    setSavingFolder(false);
  };

  const refreshRoles = () => {
    fetch(`/api/contractors/${id}/roles`)
      .then(r => r.json())
      .then(data => setRoles(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const handleApproveRole = async (roleId: string) => {
    setRoleAction(roleId);
    try {
      await fetch(`/api/contractors/${id}/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      refreshRoles();
    } catch {
      // Intentionally ignored
    }
    setRoleAction(null);
  };

  const handleRejectRole = async (roleId: string) => {
    setRoleAction(roleId);
    try {
      await fetch(`/api/contractors/${id}/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      refreshRoles();
    } catch {
      // Intentionally ignored
    }
    setRoleAction(null);
  };

  const handleRemoveRole = async (roleId: string) => {
    setRoleAction(roleId);
    try {
      await fetch(`/api/contractors/${id}/roles/${roleId}`, {
        method: 'DELETE',
      });
      refreshRoles();
    } catch {
      // Intentionally ignored
    }
    setRoleAction(null);
  };

  const handleAddRole = async (roleValue: string) => {
    setRoleAction(roleValue);
    try {
      await fetch(`/api/contractors/${id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleValue }),
      });
      refreshRoles();
      setShowAddRole(false);
    } catch {
      // Intentionally ignored
    }
    setRoleAction(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/contractors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setContractor((c: any) => ({ ...c, status: newStatus }));
  };

  const handleGenerateLogin = async () => {
    setGeneratingLogin(true);
    setLoginError(null);
    try {
      const res = await fetch(`/api/contractors/${id}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contractorEmail || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setLoginCredentials(data);
      } else {
        setLoginError(data.error || `Failed (${res.status})`);
      }
    } catch (e: any) {
      setLoginError(e?.message || 'Network error — please try again');
    }
    setGeneratingLogin(false);
  };

  const handleResetPassword = async () => {
    if (!contractorEmail) return;
    setResetting(true);
    setResetResult(null);
    try {
      const res = await fetch(`/api/contractors/${id}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contractorEmail }),
      });
      const data = await res.json();
      if (res.ok) setResetResult(data);
    } catch {
      // Intentionally ignored
    }
    setResetting(false);
  };

  const openEditSow = (sow: any) => {
    const deliverables = JSON.parse(sow.deliverables || '[]');
    setEditDeliverables(deliverables.map((d: any) => typeof d === 'string' ? d : d.text));
    setEditRate(String(sow.rate));
    setEditingSow(sow);
  };

  const saveEditSow = async () => {
    if (!editingSow) return;
    setEditSaving(true);
    try {
      const res = await fetch('/api/sows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSow.id,
          rate: parseFloat(editRate),
          deliverables: JSON.stringify(editDeliverables.filter(d => d.trim()).map(d => ({ text: d.trim(), status: 'pending' }))),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setContractor((c: any) => ({
          ...c,
          sows: c.sows.map((s: any) => s.id === updated.id ? updated : s),
        }));
        setEditingSow(null);
      }
    } catch {
      // Intentionally ignored
    }
    setEditSaving(false);
  };

  if (loading) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>;
  if (!contractor) return <div className="flex min-h-screen bg-[#F8F9FC]"><Sidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Contractor not found</div></main></div>;

  const approvedCount = roles.filter(r => r.status === 'approved').length;
  const assignedRoleValues = roles.map(r => r.role);
  const unassignedRoles = AVAILABLE_ROLES.filter(r => !assignedRoleValues.includes(r.value));

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl">
                {ROLE_ICONS[contractor.role] || '📋'}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-black text-dark-800">{contractor.name}</h1>
                <p className="text-muted text-sm">{contractor.businessName} — <span className="capitalize">{contractor.role.replace(/-/g, ' ')}</span></p>
              </div>
            </div>
            <StatusBadge status={contractor.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Jurisdiction</div>
              <div className="text-sm font-semibold text-dark-800">{contractor.state}, {contractor.country}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Active SOWs</div>
              <div className="text-sm font-semibold text-dark-800">{contractor.sows?.length || 0}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs font-semibold text-muted mb-2">Assembled Contracts</div>
              <div className="text-sm font-semibold text-dark-800">{contractor.assembledContracts?.length || 0}</div>
            </div>
          </div>

          <div className="glass-card p-6 mb-8">
            <h3 className="font-heading font-bold text-dark-800 mb-4">Google Drive Folder</h3>
            <p className="text-muted text-xs mb-4">Assign a Google Drive folder where this contractor uploads project deliverables.</p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-muted mb-1">Folder URL or ID</label>
                <input
                  type="text"
                  value={driveFolderUrl}
                  onChange={e => setDriveFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                />
              </div>
              <button
                onClick={handleSaveDriveFolder}
                disabled={savingFolder}
                className="btn-primary text-sm whitespace-nowrap disabled:opacity-50"
              >
                {savingFolder ? 'Saving...' : 'Save Folder'}
              </button>
            </div>
            {folderMessage && (
              <p className={`text-xs mt-2 font-semibold ${folderMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {folderMessage.text}
              </p>
            )}
            {contractor.googleDriveFolderId && (
              <p className="text-xs text-muted mt-3">
                Connected: <span className="font-mono text-dark-800">{contractor.googleDriveFolderId}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Tax & Compliance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Tax Form (W-9/W-8BEN)</span>
                  <span className={`font-semibold ${contractor.taxFormUrl ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {contractor.taxFormUrl ? '✓ Uploaded' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Insurance Proof</span>
                  <span className={`font-semibold ${contractor.insuranceProofUrl ? 'text-emerald-600' : 'text-muted'}`}>
                    {contractor.insuranceProofUrl ? '✓ Uploaded' : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Licensing Proof</span>
                  <span className={`font-semibold ${contractor.licensingProofUrl ? 'text-emerald-600' : 'text-muted'}`}>
                    {contractor.licensingProofUrl ? '✓ Uploaded' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {loginCredentials && (
                  <div className="p-4 bg-miami-pink/5 border border-miami-pink/20 rounded-xl mb-3">
                    <div className="text-xs font-bold text-miami-pink mb-2">Contractor Login Credentials</div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-muted">Email:</span> <span className="font-mono font-semibold text-dark-800">{loginCredentials.email}</span></div>
                      <div><span className="text-muted">Password:</span> <span className="font-mono font-semibold text-dark-800">{loginCredentials.password}</span></div>
                    </div>
                    <p className="text-[0.65rem] text-muted mt-2">Share these credentials with the contractor. They can log in at /login.</p>
                  </div>
                )}
                {resetResult && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-3">
                    <div className="text-xs font-bold text-blue-700 mb-2">Password Reset</div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-muted">Email:</span> <span className="font-mono font-semibold text-dark-800">{resetResult.email}</span></div>
                      <div><span className="text-muted">New Password:</span> <span className="font-mono font-semibold text-dark-800">{resetResult.password}</span></div>
                    </div>
                    <p className="text-[0.65rem] text-muted mt-2">Share this new password securely with the contractor.</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Contractor Email</label>
                  <input
                    type="email"
                    value={contractorEmail}
                    onChange={e => setContractorEmail(e.target.value)}
                    placeholder="contractor@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border-2 border-muted-lighter bg-white text-dark-800 text-xs"
                  />
                </div>
                <button
                  onClick={handleGenerateLogin}
                  disabled={generatingLogin}
                  className="btn-primary w-full justify-center text-sm disabled:opacity-50"
                >
                  {generatingLogin ? 'Generating...' : loginCredentials ? '🔄 Reset Password' : '🔑 Generate Contractor Login'}
                </button>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {loginError}
                  </div>
                )}
                {contractorEmail && (
                  <button
                    onClick={handleResetPassword}
                    disabled={resetting}
                    className="btn-secondary w-full justify-center text-sm disabled:opacity-50"
                  >
                    {resetting ? 'Resetting...' : '🔐 Reset Password for This Email'}
                  </button>
                )}
                <Link href={`/onboarding/${contractor.id}`} className="btn-secondary w-full justify-center text-sm">
                  📄 Contractor Onboarding
                </Link>
                <Link href={`/sow-builder?contractorId=${contractor.id}`} className="btn-secondary w-full justify-center text-sm">
                  📝 Create SOW
                </Link>
                <button
                  onClick={() => handleStatusChange(contractor.status === 'active' ? 'terminated' : 'active')}
                  className={`w-full text-center text-sm font-semibold px-5 py-2.5 rounded-full border transition-all ${
                    contractor.status === 'active'
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {contractor.status === 'active' ? 'Terminate Contractor' : 'Activate Contractor'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden mb-8">
            <div className="p-5 border-b border-muted-lighter flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-dark-800">Roles</h3>
                <p className="text-muted text-xs mt-1">{roles.length} role(s) assigned — {approvedCount} approved</p>
              </div>
              {unassignedRoles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowAddRole(!showAddRole)}
                    className="px-4 py-2 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors"
                  >
                    + Add Role
                  </button>
                  {showAddRole && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-muted-lighter rounded-xl shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                      {unassignedRoles.map(r => (
                        <button
                          key={r.value}
                          onClick={() => handleAddRole(r.value)}
                          disabled={roleAction === r.value}
                          className="w-full text-left px-4 py-2.5 text-sm text-dark-800 hover:bg-muted-lighter/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <span>{r.icon}</span>
                          <span>{r.label}</span>
                          {roleAction === r.value && <span className="ml-auto text-xs text-muted">Adding...</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {rolesLoading ? (
              <div className="p-5 text-muted text-sm">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="p-5 text-muted text-sm">No roles assigned yet.</div>
            ) : (
              <div className="divide-y divide-muted-lighter/50">
                {roles.map((r: any) => {
                  const style = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                  const isLastApproved = r.status === 'approved' && approvedCount <= 1;
                  return (
                    <div key={r.id} className="p-4 flex items-center justify-between hover:bg-white/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ROLE_ICONS[r.role] || '📋'}</span>
                        <div>
                          <div className="text-sm font-semibold text-dark-800 capitalize">{r.role.replace(/-/g, ' ')}</div>
                          <div className="text-xs text-muted">
                            Requested {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {r.status}
                        </span>
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRole(r.id)}
                              disabled={roleAction === r.id}
                              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                              {roleAction === r.id ? '...' : '✓ Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectRole(r.id)}
                              disabled={roleAction === r.id}
                              className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {roleAction === r.id ? '...' : '✕ Reject'}
                            </button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <button
                            onClick={() => handleRemoveRole(r.id)}
                            disabled={roleAction === r.id || isLastApproved}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                              isLastApproved
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                            }`}
                            title={isLastApproved ? 'Cannot remove the last approved role' : 'Remove role'}
                          >
                            {roleAction === r.id ? '...' : 'Remove'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {contractor.sows?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-muted-lighter">
                <h3 className="font-heading font-bold text-dark-800">Statements of Work</h3>
                <p className="text-muted text-xs mt-1">SOW must be approved before a contract can be assembled</p>
              </div>
              <div className="divide-y divide-muted-lighter/50">
                {contractor.sows.map((sow: any) => (
                  <div key={sow.id} className="p-4 flex items-center justify-between hover:bg-white/50">
                    <div>
                      <div className="text-sm font-semibold text-dark-800">{sow.rateType} — ${sow.rate}</div>
                      <div className="text-xs text-muted">Started {sow.startDate} · {sow.paymentSchedule}</div>
                      {sow.deliverables && JSON.parse(sow.deliverables || '[]').length > 0 && (
                        <div className="text-xs text-muted mt-1">
                          {JSON.parse(sow.deliverables).length} deliverable(s)
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={sow.status} />
                      <button
                        onClick={() => openEditSow(sow)}
                        className="px-3 py-1.5 bg-white border border-muted-lighter text-dark-800 text-xs font-semibold rounded-lg hover:bg-muted-lighter/30 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      {sow.status === 'draft' && (
                        <button
                          onClick={async () => {
                            await fetch('/api/sows', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: sow.id, status: 'approved' }),
                            });
                            setContractor((c: any) => ({
                              ...c,
                              sows: c.sows.map((s: any) => s.id === sow.id ? { ...s, status: 'approved' } : s),
                            }));
                          }}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {sow.status === 'approved' && (
                        <button
                          onClick={async () => {
                            await fetch('/api/sows', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: sow.id, status: 'active' }),
                            });
                            setContractor((c: any) => ({
                              ...c,
                              sows: c.sows.map((s: any) => s.id === sow.id ? { ...s, status: 'active' } : s),
                            }));
                          }}
                          className="px-3 py-1.5 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {editingSow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-muted-lighter">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-dark-800 text-lg">Edit Statement of Work</h3>
                <button onClick={() => setEditingSow(null)} className="text-muted hover:text-dark-800 text-lg">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Rate ($)</label>
                <input
                  type="number" step="0.01"
                  value={editRate}
                  onChange={e => setEditRate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Deliverables</label>
                <div className="space-y-2">
                  {editDeliverables.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text" value={d}
                        onChange={e => {
                          const next = [...editDeliverables];
                          next[i] = e.target.value;
                          setEditDeliverables(next);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                        placeholder={`Deliverable ${i + 1}`}
                      />
                      <button
                        onClick={() => setEditDeliverables(editDeliverables.filter((_, idx) => idx !== i))}
                        className="px-2 text-red-400 hover:text-red-600 text-sm"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setEditDeliverables([...editDeliverables, ''])}
                  className="mt-2 text-miami-pink text-xs font-semibold hover:underline"
                >+ Add Deliverable</button>
              </div>
            </div>
            <div className="p-6 border-t border-muted-lighter flex gap-3">
              <button onClick={saveEditSow} disabled={editSaving} className="btn-primary disabled:opacity-50">
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingSow(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
