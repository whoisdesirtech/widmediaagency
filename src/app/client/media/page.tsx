'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
}

interface ClientData {
  id: string;
  name: string;
  businessName?: string;
  googleDriveFolderId?: string;
  googleDriveFolderUrl?: string;
  status: string;
}

export default function ClientMediaPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.clientId) {
      fetch(`/api/clients/${u.clientId}`)
        .then(r => r.json())
        .then(data => { setClient(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main>
    </div>
  );

  if (!client) return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <div className="font-heading font-bold text-dark-800 mb-1">No Client Profile</div>
          <div className="text-muted text-sm">Your account is not linked to a client profile. Contact your agency admin.</div>
        </div>
      </main>
    </div>
  );

  const hasFolderId = !!client.googleDriveFolderId;
  const hasFolderUrl = !!client.googleDriveFolderUrl;

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl">
              🖼️
            </div>
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Media Gallery</h1>
              <p className="text-muted text-sm">Your images and videos from Google Drive</p>
            </div>
          </div>

          {hasFolderId ? (
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-muted-lighter">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-dark-800">Your Media Folder</h3>
                    <p className="text-muted text-xs mt-1">Browse, preview, and download your media files</p>
                  </div>
                  <a
                    href={`https://drive.google.com/drive/folders/${client.googleDriveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs"
                  >
                    Open in Google Drive ↗
                  </a>
                </div>
              </div>
              <div className="p-2">
                <iframe
                  src={`https://drive.google.com/embeddedfolderview?id=${client.googleDriveFolderId}#list`}
                  className="w-full border-0 rounded-lg"
                  style={{ height: '800px' }}
                  title="Media Gallery"
                />
              </div>
            </div>
          ) : hasFolderUrl ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-4">📂</div>
              <div className="font-heading font-bold text-dark-800 mb-2">Media Folder Available</div>
              <div className="text-muted text-sm mb-6">
                Click the button below to access your media files in Google Drive.
              </div>
              <a
                href={client.googleDriveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex justify-center text-sm"
              >
                Open Media Folder ↗
              </a>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="font-heading font-bold text-dark-800 mb-2">No Media Folder Configured</div>
              <div className="text-muted text-sm">
                Your agency admin has not yet configured a media folder for your account.
                <br />Please contact them to set up media access.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
