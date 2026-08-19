'use client';

import React, { useEffect, useState } from 'react';
import ContractorSidebar from '@/components/ContractorSidebar';
import MediaTile from '@/components/MediaTile';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  contractorId?: string;
  clientId?: string;
  contractorRole?: string;
  contractorRoles?: string[];
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
  description: string;
  icon: string;
  status: string;
  progress: number;
  timeline: string;
  deliverables: number;
  images: string;
  client: { id: string; name: string; email: string };
}

interface DriveFolder {
  id: string;
  name: string;
  icon: string;
  driveFolderId: string | null;
  driveFolderUrl: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  'planning': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'review': 'bg-indigo-100 text-indigo-700',
  'complete': 'bg-emerald-100 text-emerald-700',
};

const STATUS_LABELS: Record<string, string> = {
  'planning': '🟢 Planning',
  'in-progress': '🟡 In Progress',
  'review': '🔵 Review',
  'complete': '✅ Complete',
};

export default function ContractorProjectsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [foldersByProject, setFoldersByProject] = useState<Record<string, DriveFolder[]>>({});
  const [selectedFolderByProject, setSelectedFolderByProject] = useState<Record<string, string>>({});
  const [filesByProject, setFilesByProject] = useState<Record<string, File[]>>({});
  const [uploadingProject, setUploadingProject] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    const u = JSON.parse(stored);
    setUser(u);

    if (u.contractorId) {
      fetch(`/api/projects?contractorId=${u.contractorId}`)
        .then(r => r.json())
        .then(data => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const getProjectImages = (project: Project): ProjectImage[] => {
    try { return JSON.parse(project.images || '[]'); } catch { return []; }
  };

  const loadFolders = async (project: Project) => {
    if (!project.client?.id || foldersByProject[project.id]) return;
    try {
      const contractorId = user?.contractorId;
      const [foldersRes, clientRes, contractorRes] = await Promise.all([
        fetch(`/api/folders?clientId=${project.client.id}`),
        fetch(`/api/clients/${project.client.id}`),
        contractorId ? fetch(`/api/contractors/${contractorId}`) : Promise.resolve(null),
      ]);
      const foldersData = await foldersRes.json();
      const clientData = await clientRes.json();
      const contractorData = contractorRes ? await contractorRes.json() : null;
      const subFolders: DriveFolder[] = Array.isArray(foldersData) ? foldersData.filter((f: DriveFolder) => f.driveFolderId || f.driveFolderUrl) : [];
      if (subFolders.length === 0 && contractorData?.googleDriveFolderId) {
        subFolders.push({
          id: 'contractor-root',
          name: `${contractorData.name} — My Drive Folder`,
          icon: '📂',
          driveFolderId: contractorData.googleDriveFolderId,
          driveFolderUrl: contractorData.googleDriveFolderUrl,
        });
      } else if (subFolders.length === 0 && clientData?.googleDriveFolderId) {
        subFolders.push({
          id: 'root',
          name: `${project.client.name} — Main Folder`,
          icon: '📁',
          driveFolderId: clientData.googleDriveFolderId,
          driveFolderUrl: clientData.googleDriveFolderUrl,
        });
      }
      setFoldersByProject(prev => ({ ...prev, [project.id]: subFolders }));
      if (subFolders.length > 0 && !selectedFolderByProject[project.id]) {
        const preferred = subFolders.find((f: DriveFolder) => /photo|image|my drive/i.test(f.name)) || subFolders[0];
        setSelectedFolderByProject(prev => ({ ...prev, [project.id]: preferred.driveFolderId || preferred.driveFolderUrl || preferred.id }));
      }
    } catch {
      // Intentionally ignored
    }
  };

  const handleDriveUpload = async (project: Project) => {
    const files = filesByProject[project.id] || [];
    const folderValue = selectedFolderByProject[project.id];
    if (files.length === 0) {
      setUploadMessage(prev => ({ ...prev, [project.id]: { type: 'error', text: 'Select at least one photo to upload.' } }));
      return;
    }
    if (!folderValue) {
      setUploadMessage(prev => ({ ...prev, [project.id]: { type: 'error', text: 'No Google Drive folder is linked to this project yet. Ask the agency to link one.' } }));
      return;
    }

    setUploadingProject(project.id);
    setUploadMessage(prev => ({ ...prev, [project.id]: { type: 'success', text: `Uploading ${files.length} file${files.length > 1 ? 's' : ''}…` } }));
    try {
      const formData = new FormData();
      formData.append('folderId', folderValue);
      files.forEach(file => formData.append('files', file));
      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && Array.isArray(data.files)) {
        setUploadMessage(prev => ({ ...prev, [project.id]: { type: 'success', text: `✅ ${data.files.length} photo${data.files.length > 1 ? 's' : ''} uploaded to Google Drive — shared with the client.` } }));
        setFilesByProject(prev => ({ ...prev, [project.id]: [] }));
      } else {
        setUploadMessage(prev => ({ ...prev, [project.id]: { type: 'error', text: data.error || 'Upload failed. Try again.' } }));
      }
    } catch {
      setUploadMessage(prev => ({ ...prev, [project.id]: { type: 'error', text: 'Connection error during upload. Try again.' } }));
    }
    setUploadingProject(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ContractorSidebar user={user || undefined} contractorRoles={user?.contractorRoles} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">My Projects</h1>
            <p className="text-muted text-sm mt-1">Projects assigned to you across all clients</p>
          </div>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📁</div>
              <div className="font-heading font-bold text-dark-800 mb-1">No Projects Assigned</div>
              <div className="text-muted text-sm">No projects have been assigned to you yet.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => {
                const timeline = JSON.parse(project.timeline || '[]');
                const images = getProjectImages(project);
                const isExpanded = selectedProject?.id === project.id;
                return (
                  <div key={project.id} className="glass-card p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { const isExpanded = selectedProject?.id === project.id; setSelectedProject(isExpanded ? null : project); if (!isExpanded) loadFolders(project); }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{project.icon}</span>
                        <div>
                          <h3 className="font-heading font-bold text-dark-800">{project.name}</h3>
                          <p className="text-xs text-muted">{project.client.name} · {project.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`}>
                          {STATUS_LABELS[project.status]}
                        </span>
                        {images.length > 0 && (
                          <span className="text-[0.65rem] text-muted">🖼️ {images.length}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-2 bg-muted-lighter rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-miami-pink to-miami-blue-light rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-dark-800">{project.progress}%</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{project.deliverables} deliverables</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-muted-lighter space-y-4" onClick={(e) => e.stopPropagation()}>
                        {timeline.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-dark-800 text-sm mb-3">Timeline</h4>
                            <div className="space-y-2">
                              {timeline.map((step: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-muted-lighter text-muted'}`}>
                                    {step.done ? '✓' : i + 1}
                                  </div>
                                  <span className={`text-sm ${step.done ? 'text-dark-800 font-semibold' : 'text-muted'}`}>{step.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {images.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-dark-800 text-sm mb-3">Project Images</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {images.slice(0, 8).map((img, i) => (
                                <div key={i} className="relative group rounded-xl overflow-hidden border border-muted-lighter">
                                  <MediaTile img={img} className="h-32" onClick={() => setPreviewImage(img.url)} />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
                                    <p className="text-white text-[0.6rem] truncate">{img.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-muted-lighter">
                          <h4 className="font-heading font-bold text-dark-800 text-sm mb-3">📤 Deliver Photos to Client Drive</h4>
                          {foldersByProject[project.id] && foldersByProject[project.id].length > 0 ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-semibold text-dark-800 mb-1.5">Google Drive folder</label>
                                <select
                                  value={selectedFolderByProject[project.id] || ''}
                                  onChange={e => setSelectedFolderByProject(prev => ({ ...prev, [project.id]: e.target.value }))}
                                  className="w-full px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                                >
                                  {foldersByProject[project.id].map(folder => (
                                    <option key={folder.id} value={folder.driveFolderId || folder.driveFolderUrl || folder.id}>
                                      {folder.icon} {folder.name}
                                    </option>
                                  ))}
                                </select>
                                <p className="text-[0.65rem] text-muted mt-1">Uploads go straight to this folder, which is shared with the client.</p>
                              </div>
                              <div>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  disabled={uploadingProject === project.id}
                                  onChange={e => setFilesByProject(prev => ({ ...prev, [project.id]: Array.from(e.target.files || []) }))}
                                  className="block w-full text-sm text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-miami-pink file:text-white hover:file:bg-miami-pink/80"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleDriveUpload(project)}
                                  disabled={uploadingProject === project.id}
                                  className="px-4 py-2 bg-miami-pink text-white text-xs font-semibold rounded-lg hover:bg-miami-pink/80 transition-colors disabled:opacity-50"
                                >
                                  {uploadingProject === project.id ? 'Uploading…' : 'Upload Photos to Drive'}
                                </button>
                                {filesByProject[project.id]?.length > 0 && (
                                  <span className="text-xs text-muted">{filesByProject[project.id].length} file{filesByProject[project.id].length > 1 ? 's' : ''} selected</span>
                                )}
                              </div>
                              {uploadMessage[project.id] && (
                                <div className={`px-4 py-3 rounded-xl text-xs font-semibold ${uploadMessage[project.id].type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                  {uploadMessage[project.id].text}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted">No shared Google Drive folder is linked to this project&apos;s client yet. Ask the agency admin to link one.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" />
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg flex items-center justify-center hover:bg-white/30">✕</button>
        </div>
      )}
    </div>
  );
}
