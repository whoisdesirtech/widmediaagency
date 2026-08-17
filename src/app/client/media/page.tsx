'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';
import MediaTile from '@/components/MediaTile';
import { driveFolderUrl, driveFolderEmbedUrl } from '@/lib/drive';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
}

interface ProjectImage {
  url: string;
  name: string;
  uploadedAt: string;
  kind?: 'image' | 'folder' | 'file';
}

interface Project {
  id: string;
  name: string;
  icon: string;
  images: string;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  driveFolderId: string | null;
  driveFolderUrl: string | null;
}

function MediaContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [view, setView] = useState<'projects' | 'folders'>('projects');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.clientId) {
      Promise.all([
        fetch(`/api/projects?clientId=${u.clientId}`).then(r => r.json()),
        fetch(`/api/folders?clientId=${u.clientId}`).then(r => r.json()),
        fetch(`/api/clients/${u.clientId}`).then(r => r.json()),
      ]).then(([p, f, clientData]) => {
        const projectsData = Array.isArray(p) ? p : [];
        const foldersData: Folder[] = Array.isArray(f) ? f : [];
        if (foldersData.length === 0 && clientData?.googleDriveFolderId) {
          foldersData.push({
            id: 'root',
            name: 'Media Folder',
            icon: '📁',
            driveFolderId: clientData.googleDriveFolderId,
            driveFolderUrl: clientData.googleDriveFolderUrl,
          });
        }
        setProjects(projectsData);
        setFolders(foldersData);
        const folderParam = searchParams.get('folder');
        const requested = folderParam ? foldersData.find((x: Folder) => x.id === folderParam) : null;
        if (requested) {
          setActiveFolder(requested);
          setView('folders');
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const getProjectImages = (project: Project): ProjectImage[] => {
    try { return JSON.parse(project.images || '[]'); } catch { return []; }
  };

  const allProjects = projects.filter(p => getProjectImages(p).length > 0);

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
              <p className="text-muted text-sm">Browse project images and media folders</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setView('projects'); setActiveProject(null); setActiveFolder(null); }} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${view === 'projects' ? 'bg-dark text-white' : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'}`}>
              📁 By Project
            </button>
            <button onClick={() => { setView('folders'); setActiveProject(null); setActiveFolder(null); }} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${view === 'folders' ? 'bg-dark text-white' : 'bg-white border border-muted-lighter text-dark-800 hover:bg-muted-lighter/30'}`}>
              📂 Media Folders
            </button>
          </div>

          {/* Active Project Images */}
          {activeProject ? (
            <div>
              <button onClick={() => setActiveProject(null)} className="text-miami-pink text-xs font-semibold hover:underline mb-4 inline-flex items-center gap-1">
                ← Back to Projects
              </button>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{activeProject.icon}</span>
                  <div>
                    <h2 className="font-heading font-bold text-dark-800">{activeProject.name}</h2>
                    <p className="text-xs text-muted">{getProjectImages(activeProject).length} images</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getProjectImages(activeProject).map((img, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-muted-lighter">
                      <MediaTile img={img} className="h-40" onClick={() => setPreviewImage(img.url)} />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
                        <p className="text-white text-[0.65rem] truncate">{img.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeFolder ? (
            <div>
              <button onClick={() => setActiveFolder(null)} className="text-miami-pink text-xs font-semibold hover:underline mb-4 inline-flex items-center gap-1">
                ← Back to Folders
              </button>
              {(activeFolder.driveFolderId || activeFolder.driveFolderUrl) ? (() => {
                const cleanUrl = driveFolderUrl(activeFolder.driveFolderId || activeFolder.driveFolderUrl);
                const embedUrl = driveFolderEmbedUrl(activeFolder.driveFolderId || activeFolder.driveFolderUrl);
                return (
                  <div className="glass-card p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-miami-pink/5 border border-miami-pink/10 flex items-center justify-center text-3xl">
                        {activeFolder.icon}
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-bold text-dark-800">{activeFolder.name}</h3>
                        <p className="text-muted text-sm">Browse and preview files directly here.</p>
                      </div>
                    </div>
                    {embedUrl && (
                      <iframe
                        src={embedUrl}
                        title={`${activeFolder.name} — Google Drive`}
                        className="w-full h-[480px] rounded-xl border border-muted-lighter bg-white"
                        loading="lazy"
                      />
                    )}
                    <p className="text-xs text-muted mt-4 mb-4">
                      If the preview above asks for access, your agency may need to share the folder with
                      &quot;Anyone with the link&quot;. You can also open it directly in Google Drive:
                    </p>
                    {cleanUrl && (
                      <a
                        href={cleanUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2 text-sm"
                      >
                        Open in Google Drive ↗
                      </a>
                    )}
                  </div>
                );
              })() : (
                <div className="glass-card p-12 text-center">
                  <div className="text-4xl mb-4">{activeFolder.icon}</div>
                  <div className="font-heading font-bold text-dark-800 mb-2">No Drive Folder Connected</div>
                  <div className="text-muted text-sm">Ask your agency admin to link a Google Drive folder.</div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {view === 'projects' ? (
                allProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProjects.map((project) => {
                      const images = getProjectImages(project);
                      return (
                        <button key={project.id} onClick={() => setActiveProject(project)} className="glass-card p-6 text-left hover:shadow-md transition-all group">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-miami-pink/5 border border-miami-pink/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                              {project.icon}
                            </div>
                            <div>
                              <h3 className="font-heading font-bold text-dark-800">{project.name}</h3>
                              <p className="text-xs text-muted">{images.length} images</p>
                            </div>
                          </div>
                          {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-1.5 mt-3">
                              {images.slice(0, 3).map((img, i) => (
                                <div key={i} className="rounded-lg overflow-hidden aspect-square">
                                  <MediaTile img={img} className="w-full h-full" onClick={() => setPreviewImage(img.url)} />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-end text-miami-pink text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            View images →
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-4">🖼️</div>
                    <div className="font-heading font-bold text-dark-800 mb-2">No Project Images Yet</div>
                    <div className="text-muted text-sm">Your agency will upload images to your projects soon.</div>
                  </div>
                )
              ) : (
                folders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                      <button key={folder.id} onClick={() => setActiveFolder(folder)} className="glass-card p-6 text-left hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-miami-pink/5 border border-miami-pink/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {folder.icon}
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-dark-800">{folder.name}</h3>
                            <p className="text-xs text-muted">{folder.driveFolderId ? '✓ Connected' : '⚠ Not connected'}</p>
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
                    <div className="text-muted text-sm">Your agency will set up media folders for your account.</div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" />
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg flex items-center justify-center hover:bg-white/30">✕</button>
        </div>
      )}
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
