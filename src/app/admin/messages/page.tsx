'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface Option {
  id: string;
  name: string;
}

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  body: string;
  calendarEventTitle: string | null;
  calendarEventStartsAt: string | null;
  calendarEventEndsAt: string | null;
  calendarEventUrl: string | null;
  createdAt: string;
}

interface Thread {
  id: string;
  title: string;
  client: Option;
  contractor: Option | null;
  project: Option | null;
  lastMessageAt: string;
  messages?: Message[];
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [clients, setClients] = useState<Option[]>([]);
  const [contractors, setContractors] = useState<Option[]>([]);
  const [projects, setProjects] = useState<Option[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newContractorId, setNewContractorId] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newFirstMessage, setNewFirstMessage] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedStart, setSchedStart] = useState('');

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/threads');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setThreads(data);
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
    setLoading(false);
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      const [cRes, kRes, pRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/contractors'),
        fetch('/api/projects'),
      ]);
      if (cRes.ok) setClients((await cRes.json()) as Option[]);
      if (kRes.ok) setContractors((await kRes.json()) as Option[]);
      if (pRes.ok) setProjects((await pRes.json()) as Option[]);
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin' && u.role !== 'staff') { router.push('/dashboard'); return; }
    setUser(u);
    loadThreads();
  }, [router, loadThreads]);

  const loadThread = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/api/messages/threads/${threadId}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setActiveThread(data);
      setThreads(prev => prev.map(t => (t.id === data.id ? { ...t, ...data, messages: undefined } : t)));
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  }, []);

  const handleSelect = (thread: Thread) => {
    if (activeThread?.id === thread.id && activeThread.messages?.length) return;
    setActiveThread({ ...thread, messages: [] });
    loadThread(thread.id);
  };

  const handleCreate = async () => {
    if (!newTitle || !newClientId) return;
    try {
      const res = await fetch('/api/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          clientId: newClientId,
          contractorId: newContractorId || null,
          projectId: newProjectId || null,
          body: newFirstMessage || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const thread = await res.json();
      await loadThreads();
      setShowCreate(false);
      setNewTitle('');
      setNewClientId('');
      setNewContractorId('');
      setNewProjectId('');
      setNewFirstMessage('');
      handleSelect(thread);
    } catch (err) {
      console.error('Failed to create thread:', err);
    }
  };

  const handleSend = async (withEvent: boolean) => {
    const text = newMessage.trim();
    if (!text || !activeThread || sending) return;
    if (withEvent && (!schedTitle || !schedStart)) {
      alert('For a calendar invite, provide the event title and start time.');
      return;
    }
    setSending(true);
    try {
      const payload: any = { body: text };
      if (withEvent) {
        const start = new Date(schedStart);
        payload.calendar = {
          title: schedTitle,
          startsAt: start.toISOString(),
          endsAt: new Date(start.getTime() + 3600000).toISOString(),
        };
      }
      const res = await fetch(`/api/messages/threads/${activeThread.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send');
      const msg = await res.json();
      setActiveThread(prev => prev ? { ...prev, messages: [...(prev.messages ?? []), msg] } : prev);
      setNewMessage('');
      setSchedTitle('');
      setSchedStart('');
    } catch (err) {
      console.error('Failed to send:', err);
      alert('Failed to send message.');
    }
    setSending(false);
  };

  const lastMessage = (thread: Thread): string => {
    const msgs = activeThread?.id === thread.id ? (activeThread.messages ?? []) : [];
    if (msgs.length) return msgs[msgs.length - 1].body;
    return 'Click to open conversation';
  };

  const lastTime = (thread: Thread): string => {
    const msgs = activeThread?.id === thread.id ? (activeThread.messages ?? []) : [];
    if (msgs.length) {
      const d = new Date(msgs[msgs.length - 1].createdAt);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return '';
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">Messages</h1>
              <p className="text-white/50 text-sm mt-1">Client & contractor conversations</p>
            </div>
            <button
              onClick={() => { setShowCreate(true); loadOptions(); }}
              className="px-4 py-2 text-sm font-medium text-white bg-miami-pink hover:bg-miami-pink/90 rounded-lg transition-colors"
            >
              + New Thread
            </button>
          </div>

          {showCreate && (
            <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">New Conversation</h2>
                <button onClick={() => setShowCreate(false)} className="text-white/50 hover:text-white text-sm">
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Website Redesign"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Client *</label>
                  <select
                    value={newClientId}
                    onChange={e => setNewClientId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink text-sm"
                  >
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Contractor (optional)</label>
                  <select
                    value={newContractorId}
                    onChange={e => setNewContractorId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink text-sm"
                  >
                    <option value="">No contractor</option>
                    {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Project (optional)</label>
                  <select
                    value={newProjectId}
                    onChange={e => setNewProjectId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink text-sm"
                  >
                    <option value="">No project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">Opening message (optional)</label>
                  <textarea
                    value={newFirstMessage}
                    onChange={e => setNewFirstMessage(e.target.value)}
                    rows={3}
                    placeholder="Say hello and set the context..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCreate}
                  disabled={!newTitle || !newClientId}
                  className="px-4 py-2 text-sm font-medium text-white bg-miami-pink hover:bg-miami-pink/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  Create Thread
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center text-white/40 py-20">Loading conversations...</div>
          ) : threads.length === 0 ? (
            <div className="text-center text-white/40 py-20">
              No conversations yet. Start one with the New Thread button.
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
              <div className="flex h-full">
                <div className="w-80 border-r border-white/10 flex flex-col">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-semibold text-sm">Conversations</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {threads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => handleSelect(thread)}
                        className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors ${activeThread?.id === thread.id ? 'bg-miami-pink/10 border-l-2 border-l-miami-pink' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">💬</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-white truncate">{thread.title}</span>
                              <span className="text-[0.6rem] text-white/40">{lastTime(thread)}</span>
                            </div>
                            <p className="text-xs text-white/50 truncate mt-0.5">
                              {thread.client.name}{thread.contractor ? ` · ${thread.contractor.name}` : ''}
                            </p>
                            <p className="text-xs text-white/40 truncate mt-0.5">{lastMessage(thread)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  {activeThread ? (
                    <>
                      <div className="p-4 border-b border-white/10">
                        <span className="text-white font-semibold text-sm">{activeThread.title}</span>
                        <span className="text-xs text-white/50 ml-2">
                          {activeThread.client.name}
                          {activeThread.contractor ? ` · ${activeThread.contractor.name}` : ''}
                          {activeThread.project ? ` · ${activeThread.project.name}` : ''}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!activeThread.messages?.length && (
                          <div className="text-center text-white/40 text-sm py-10">No messages yet.</div>
                        )}
                        {(activeThread.messages ?? []).map((msg) => {
                          const mine = msg.senderType === 'admin';
                          return (
                            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                mine
                                  ? 'bg-miami-pink text-white rounded-br-md'
                                  : 'bg-white/10 border border-white/10 text-white rounded-bl-md'
                              }`}>
                                {!mine && (
                                  <p className="text-[0.6rem] mb-1 font-semibold text-white/50">{msg.senderName}</p>
                                )}
                                <p>{msg.body}</p>
                                {msg.calendarEventTitle && (
                                  <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${
                                    mine ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70'
                                  }`}>
                                    <p className="font-semibold">📅 {msg.calendarEventTitle}</p>
                                    {msg.calendarEventStartsAt && (
                                      <p className="mt-0.5">
                                        {new Date(msg.calendarEventStartsAt).toLocaleString(undefined, {
                                          dateStyle: 'medium',
                                          timeStyle: 'short',
                                        })}
                                      </p>
                                    )}
                                    {msg.calendarEventUrl && (
                                      <a href={msg.calendarEventUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-block mt-1 underline text-white/80">
                                        View in Google Calendar
                                      </a>
                                    )}
                                  </div>
                                )}
                                <p className={`text-[0.6rem] mt-1 ${mine ? 'text-white/60' : 'text-white/40'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-4 border-t border-white/10">
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={schedTitle}
                            onChange={e => setSchedTitle(e.target.value)}
                            placeholder="Calendar event title (optional)"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 text-sm focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                          />
                          <input
                            type="datetime-local"
                            value={schedStart}
                            onChange={e => setSchedStart(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend(false); }}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                          />
                          <button
                            onClick={() => handleSend(Boolean(schedTitle && schedStart))}
                            disabled={sending}
                            className="px-4 py-2 text-sm font-medium text-white bg-miami-pink hover:bg-miami-pink/90 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {sending ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                        {schedTitle && schedStart && (
                          <p className="text-[0.65rem] text-white/40 mt-1.5">
                            Calendar invite will be created and attached to this message.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
                      Select a conversation to start chatting
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}