'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'submitted', label: 'Submitted', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'needs-revision', label: 'Needs Revision', color: 'bg-red-100 text-red-700' },
  { value: 'approved', label: 'Approved', color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

const REVIEW_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'needs-revision', label: 'Needs Revision' },
];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
    estimatedEffort: '',
    actualEffort: '',
    deliverable: '',
    notes: '',
    reviewStatus: '',
  });

  useEffect(() => {
    fetch(`/api/tasks/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setTask(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'not-started',
          priority: data.priority || 'medium',
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
          estimatedEffort: data.estimatedEffort || '',
          actualEffort: data.actualEffort || '',
          deliverable: data.deliverable || '',
          notes: data.notes || '',
          reviewStatus: data.reviewStatus || 'pending',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setTask(updated);
        setEditMode(false);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await fetch(`/api/tasks/${params.id}`, { method: 'DELETE' });
      router.push('/developer/tasks');
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <div className="font-heading font-bold text-gray-900">Task Not Found</div>
        <Link href="/developer/tasks" className="text-pink-600 text-sm mt-2 inline-block">← Back to Tasks</Link>
      </div>
    );
  }

  const statusOpt = STATUS_OPTIONS.find(s => s.value === task.status);
  const priorityOpt = PRIORITY_OPTIONS.find(p => p.value === task.priority);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/developer/tasks" className="text-gray-400 hover:text-gray-600 text-sm">← Tasks</Link>
            <h1 className="font-heading text-2xl font-black text-gray-900 mt-1">{task.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color}`}>
                {statusOpt?.label}
              </span>
              <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${priorityOpt?.color}`}>
                {priorityOpt?.label} Priority
              </span>
              {task.project && (
                <span className="text-xs text-gray-500">in {task.project.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditMode(!editMode)} className="btn-secondary text-sm">
              {editMode ? 'Cancel' : 'Edit'}
            </button>
            {editMode && (
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button onClick={handleDelete} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Description</h3>
              {editMode ? (
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                  placeholder="Task description..." />
              ) : (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description || 'No description'}</p>
              )}
            </div>

            {/* Deliverable */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Deliverable</h3>
              {editMode ? (
                <textarea value={form.deliverable} onChange={e => setForm({ ...form, deliverable: e.target.value })}
                  rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                  placeholder="What should be delivered..." />
              ) : (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.deliverable || 'Not specified'}</p>
              )}
            </div>

            {/* Notes */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Notes</h3>
              {editMode ? (
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                  placeholder="Additional notes..." />
              ) : (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.notes || 'No notes'}</p>
              )}
            </div>

            {/* Review */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Review</h3>
              {editMode ? (
                <select value={form.reviewStatus} onChange={e => setForm({ ...form, reviewStatus: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm">
                  {REVIEW_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    task.reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    task.reviewStatus === 'needs-revision' ? 'bg-red-100 text-red-700' :
                    task.reviewStatus === 'in-review' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.reviewStatus || 'pending'}
                  </span>
                  {task.reviewer && (
                    <span className="text-xs text-gray-500">by {task.reviewer.name}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  {editMode ? (
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm mt-1">
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`text-sm font-semibold mt-1 px-2 py-0.5 rounded inline-block ${statusOpt?.color}`}>
                      {statusOpt?.label}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Priority</label>
                  {editMode ? (
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm mt-1">
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`text-sm font-semibold mt-1 px-2 py-0.5 rounded inline-block ${priorityOpt?.color}`}>
                      {priorityOpt?.label}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Due Date</label>
                  {editMode ? (
                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm mt-1" />
                  ) : (
                    <div className="text-sm text-gray-700 mt-1">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* People */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">People</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Assigned To</label>
                  <div className="text-sm text-gray-700 mt-1">
                    {task.assignedUser ? `${task.assignedUser.name} (${task.assignedUser.role})` : 'Unassigned'}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Project</label>
                  <div className="text-sm text-gray-700 mt-1">
                    {task.project ? task.project.name : 'No project'}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Portfolio Item</label>
                  <div className="text-sm text-gray-700 mt-1">
                    {task.portfolioItem ? task.portfolioItem.title : 'None'}
                  </div>
                </div>
              </div>
            </div>

            {/* Effort */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Effort</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Estimated</label>
                  {editMode ? (
                    <input type="text" value={form.estimatedEffort} onChange={e => setForm({ ...form, estimatedEffort: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm mt-1"
                      placeholder="e.g. 4h, 2d" />
                  ) : (
                    <div className="text-sm text-gray-700 mt-1">{task.estimatedEffort || '—'}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Actual</label>
                  {editMode ? (
                    <input type="text" value={form.actualEffort} onChange={e => setForm({ ...form, actualEffort: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm mt-1"
                      placeholder="e.g. 6h, 3d" />
                  ) : (
                    <div className="text-sm text-gray-700 mt-1">{task.actualEffort || '—'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
                {task.completedDate && (
                  <div className="text-emerald-600 font-semibold">
                    Completed: {new Date(task.completedDate).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
