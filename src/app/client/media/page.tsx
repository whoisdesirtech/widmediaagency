'use client';

import React, { useEffect, useState, Suspense } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  driveFolderId: string | null;
  driveFolderUrl: string | null;
}

function MediaContent() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    const params = new URLSearchParams(window.location.search);
    const folderId = params.get('folder');

    if (u.clientId) {
      fetch(`/api/folders?clientId=${u.clientId}`)
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : [];
          setFolders(list);
          if (folderId) {
            const match = list.find((f: Folder) => f.id === folderId);
            if (match) setActiveFolder(match);
          }
          setLoading(false);
        })
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
              <p className="text-muted text-sm">Browse your media files organized by folder</p>
            </div>
          </div>

          {activeFolder ? (
            <div>
              <button
                onClick={() => setActiveFolder(null)}
                className="text-miami-pink text-xs font-semibold hover:underline mb-4 inline-flex items-center gap-1"
              >
                ← Back to All Folders
              </button>

              {activeFolder.driveFolderId || activeFolder.driveFolderUrl ? (
                <div className="glass-card p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-miami-pink/5 border border-miami-pink/10 flex items-center justify-center text-5xl mx-auto mb-5">
                    {activeFolder.icon}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-dark-800 mb-2">{activeFolder.name}</h3>
                  <p className="text-muted text-sm mb-6">Click below to open this folder in Google Drive where you can browse, preview, and download all files.</p>
                  <a
                    href={activeFolder.driveFolderId
                      ? `https://drive.google.com/drive/folders/${activeFolder.driveFolderId}`
                      : activeFolder.driveFolderUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2 text-sm"
                  >
                    Open in Google Drive ↗
                  </a>
                  <p className="text-[0.65rem] text-muted mt-4">Opens in a new tab. Make sure you&apos;re signed in to your Google account.</p>
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <div className="text-4xl mb-4">{activeFolder.icon}</div>
                  <div className="font-heading font-bold text-dark-800 mb-2">No Drive Folder Connected</div>
                  <div className="text-muted text-sm">Ask your agency admin to link a Google Drive folder to this category.</div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {folders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setActiveFolder(folder)}
                      className="glass-card p-6 text-left hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-miami-pink/5 border border-miami-pink/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {folder.icon}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-dark-800">{folder.name}</h3>
                          <p className="text-xs text-muted">
                            {folder.driveFolderId ? '✓ Connected' : '⚠ Not connected'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end text-miami-pink text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Open folder →
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <div className="text-4xl mb-4">📂</div>
                  <div className="font-heading font-bold text-dark-800 mb-2">No Folders Yet</div>
                  <div className="text-muted text-sm">Your agency admin will set up media folders for your account.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ClientMediaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-[#F8F9FC]"><ClientSidebar /><main className="flex-1 ml-64 p-8"><div className="text-muted">Loading...</div></main></div>}>
      <MediaContent />
    </Suspense>
  );
}
