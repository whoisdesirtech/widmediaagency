'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'WhoIsDésir® Media Agency',
    homeJurisdiction: 'Florida, United States',
    communicationTools: ['Slack', 'Email', 'ClickUp'],
    responseTimeDefault: '24 business hours',
    urgentResponseTime: '2-4 hours',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Settings</h1>
              <p className="text-muted text-sm mt-1">Agency defaults, jurisdiction, and communication preferences.</p>
            </div>
            <button onClick={handleSave} className="btn-primary text-sm">
              {saved ? '✓ Saved' : 'Save Settings'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 text-sm mb-4">Agency Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Agency Name</label>
                  <input type="text" value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Home Jurisdiction</label>
                  <input type="text" value={settings.homeJurisdiction} onChange={e => setSettings(s => ({ ...s, homeJurisdiction: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                  <p className="text-[0.65rem] text-muted mt-1">Governs all contracts. Used for dispute resolution venue.</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 text-sm mb-4">Communication Tools</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Slack', 'Email', 'ClickUp', 'Notion', 'Microsoft Teams', 'Discord', 'Text/SMS'].map(tool => (
                  <button
                    key={tool}
                    onClick={() => {
                      setSettings(s => ({
                        ...s,
                        communicationTools: s.communicationTools.includes(tool)
                          ? s.communicationTools.filter(t => t !== tool)
                          : [...s.communicationTools, tool],
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      settings.communicationTools.includes(tool)
                        ? 'border-miami-pink bg-miami-pink/5 text-miami-pink'
                        : 'border-muted-lighter bg-white text-muted hover:border-muted-light'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 text-sm mb-4">Response Time Defaults</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Standard Response</label>
                  <input type="text" value={settings.responseTimeDefault} onChange={e => setSettings(s => ({ ...s, responseTimeDefault: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-800 mb-1.5">Urgent Response</label>
                  <input type="text" value={settings.urgentResponseTime} onChange={e => setSettings(s => ({ ...s, urgentResponseTime: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-dark-800 text-sm mb-3">Jurisdiction & Legal Notes</h3>
              <div className="text-xs text-muted leading-relaxed space-y-2">
                <p>The home jurisdiction determines governing law, dispute resolution venue, and enforceability of non-solicitation and non-compete provisions.</p>
                <p>Non-solicitation and non-compete provisions are limited or void in certain U.S. states including California, North Dakota, Oklahoma, and Minnesota. An attorney must confirm enforceability for each contractor&apos;s jurisdiction.</p>
                <p>International contractors may be subject to different dispute resolution frameworks and worker classification rules.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
