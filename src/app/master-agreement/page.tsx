'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DraftBanner from '@/components/DraftBanner';
import { FIXED_CLAUSES, ADDED_CLAUSES } from '@/data/clauses';

export default function MasterAgreementPage() {
  const [masterId, setMasterId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [clauses, setClauses] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/master-agreements')
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setMasterId(data.id);
          setClauses(data.clauses || []);
        } else {
          setClauses([...FIXED_CLAUSES, ...ADDED_CLAUSES]);
        }
      })
      .catch(() => setClauses([...FIXED_CLAUSES, ...ADDED_CLAUSES]));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = masterId ? 'PUT' : 'POST';
      const res = await fetch('/api/master-agreements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauses }),
      });
      const data = await res.json();
      if (data.id) setMasterId(data.id);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const updateClause = (id: string, content: string) => {
    setClauses(prev => prev.map(c => c.id === id ? { ...c, content } : c));
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Master Agreement</h1>
              <p className="text-muted text-sm mt-1">WhoIsDésir® Media Agency — Freelancer Talent Agreement</p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Agreement'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-primary text-sm">Edit Clauses</button>
              )}
            </div>
          </div>

          <DraftBanner />

          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-lg">📋</div>
              <div>
                <div className="font-heading font-bold text-dark-800">Master Service Agreement</div>
                <div className="text-muted text-xs">Between WhoIsDésir® Media Agency and Contractor</div>
              </div>
            </div>
            <div className="text-xs text-muted leading-relaxed">
              This Master Agreement governs the overall relationship between the Agency and Contractors.
              Individual project terms are defined in Statements of Work (SOWs) executed separately.
              Role-specific addenda may be attached to supplement project requirements.
            </div>
          </div>

          <div className="space-y-4">
            {clauses.map((clause) => (
              <div
                key={clause.id}
                className={`glass-card p-6 ${clause.isNeverChange && editing ? 'ring-2 ring-miami-pink/20' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-dark-800 text-white flex items-center justify-center text-xs font-bold">
                      {clause.number}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-dark-800 text-sm">{clause.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${
                          clause.category === 'core' ? 'bg-miami-pink/10 text-miami-pink' : 'bg-miami-blue-light/10 text-miami-blue-beach'
                        }`}>
                          {clause.category === 'core' ? 'Fixed' : 'Added'}
                        </span>
                        {clause.isNeverChange && (
                          <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Never Changes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {editing && !clause.isNeverChange ? (
                  <textarea
                    value={clause.content}
                    onChange={e => updateClause(clause.id, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-xs leading-relaxed font-mono min-h-[120px] resize-y transition-all"
                  />
                ) : (
                  <div className="text-xs text-dark-800/70 leading-relaxed whitespace-pre-line pl-11">
                    {clause.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
