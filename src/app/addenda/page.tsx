'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ADDENDUM_TEMPLATES } from '@/data/addenda';

export default function AddendaPage() {
  const [savedAddenda, setSavedAddenda] = useState<any[]>([]);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/addenda').then(r => r.json()).then(setSavedAddenda).catch(() => {});
  }, []);

  const handleSaveAddendum = async (template: typeof ADDENDUM_TEMPLATES[0]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/addenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleType: template.roleType,
          title: template.title,
          fields: template.fields,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedAddenda(prev => [...prev, data]);
      }
    } catch {}
    setSaving(false);
  };

  const isSaved = (roleType: string) => savedAddenda.some(a => a.roleType === roleType);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Addenda Library</h1>
              <p className="text-muted text-sm mt-1">Role-specific addenda attached to SOWs or the master agreement.</p>
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-miami-blue-light/10 flex items-center justify-center text-miami-blue-light text-sm">ℹ</div>
              <div className="text-xs text-muted leading-relaxed">
                <strong className="text-dark-800">Templates</strong> define the variable fields for each role.
                Save an addendum from a template to make it available for attaching to SOWs.
                This allows onboarding new roles without re-signing the master agreement.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {ADDENDUM_TEMPLATES.map(template => {
              const expanded = expandedRole === template.roleType;
              const saved = isSaved(template.roleType);

              return (
                <div key={template.roleType} className="glass-card overflow-hidden">
                  <button
                    onClick={() => setExpandedRole(expanded ? null : template.roleType)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white text-xl">
                        {template.icon}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-dark-800 text-sm">{template.title}</div>
                        <div className="text-muted text-xs mt-0.5">{template.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {saved && (
                        <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          Saved
                        </span>
                      )}
                      <span className="text-muted text-xs">{template.fields.length} fields</span>
                      <span className={`text-muted text-sm transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-5 pb-5 border-t border-muted-lighter/50">
                      <div className="mt-4 space-y-2">
                        {template.fields.map(field => (
                          <div key={field.id} className="flex items-center justify-between p-3 rounded-lg bg-white/50">
                            <div>
                              <div className="text-xs font-semibold text-dark-800">{field.label}</div>
                              {field.description && (
                                <div className="text-[0.65rem] text-muted mt-0.5">{field.description}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-dark-800/5 text-dark-800/60">
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-miami-pink/10 text-miami-pink">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        {!saved ? (
                          <button
                            onClick={() => handleSaveAddendum(template)}
                            disabled={saving}
                            className="btn-primary text-sm disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save to Library'}
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                            ✓ In Library
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
