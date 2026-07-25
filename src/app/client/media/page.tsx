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

              {activeFolder.driveFolderId ? (
                <div className="glass-card overflow-hidden">
                  <div className="p-5 border-b border-muted-lighter">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{activeFolder.icon}</span>
                        <div>
                          <h3 className="font-heading font-bold text-dark-800">{activeFolder.name}</h3>
                          <p className="text-muted text-xs mt-0.5">Browse, preview, and download files</p>
                        </div>
                      </div>
                      <a
                        href={`https://drive.google.com/drive/folders/${activeFolder.driveFolderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs"
                      >
                        Open in Google Drive ↗
                      </a>
                    </div>
                  </div>
                  <div className="p-2">
                    <iframe
                      src={`https://drive.google.com/drive/folders/${activeFolder.driveFolderId}?usp=sharing`}
                      className="w-full border-0 rounded-lg"
                      style={{ height: '800px' }}
                      title={activeFolder.name}
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  </div>
                </div>
              ) : activeFolder.driveFolderUrl ? (
                <div className="glass-card p-8 text-center">
                  <div className="text-4xl mb-4">{activeFolder.icon}</div>
                  <div className="font-heading font-bold text-dark-800 mb-2">{activeFolder.name}</div>
                  <div className="text-muted text-sm mb-6">Click below to access this folder in Google Drive.</div>
                  <a
                    href={activeFolder.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex justify-center text-sm"
                  >
                    Open Folder ↗
                  </a>
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
