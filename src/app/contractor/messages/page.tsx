'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ContractorSidebar from '@/components/ContractorSidebar';

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  body: string;
  calendarEventTitle: string | null;
  calendarEventStartsAt: string | null;
  calendarEventUrl: string | null;
  createdAt: string;
}

interface Thread {
  id: string;
  title: string;
  client: { id: string; name: string };
  contractor: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  lastMessageAt: string;
  messages: Message[];
}

export default function ContractorMessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
    loadThreads();
  }, [router, loadThreads]);

  const handleSelect = (thread: Thread) => {
    if (activeThread?.id === thread.id && activeThread.messages?.length) return;
    setActiveThread({ ...thread, messages: [] });
    loadThread(thread.id);
  };

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !activeThread || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/threads/${activeThread.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) throw new Error('Failed to send');
      const msg = await res.json();
      setActiveThread(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send:', err);
    }
    setSending(false);
  };

  const lastMessage = (thread: Thread): string => {
    const msgs = activeThread?.id === thread.id ? activeThread.messages : [];
    if (msgs.length) return msgs[msgs.length - 1].body;
    return 'Click to open conversation';
  };

  const lastTime = (thread: Thread): string => {
    const msgs = activeThread?.id === thread.id ? activeThread.messages : [];
    if (msgs.length) {
      const d = new Date(msgs[msgs.length - 1].createdAt);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return '';
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <ContractorSidebar user={user || undefined} />
      <main className="ml-64 flex-1">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-white">Messages</h1>
            <p className="text-white/50 text-sm mt-1">Client conversations about your work</p>
          </div>

          {loading ? (
            <div className="text-center text-white/40 py-20">Loading conversations...</div>
          ) : threads.length === 0 ? (
            <div className="text-center text-white/40 py-20">
              No conversations yet. When the team adds you to a thread, it will appear here.
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
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
                              {thread.client.name}
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
                          {activeThread.project ? ` · ${activeThread.project.name}` : ''}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeThread.messages.length === 0 && (
                          <div className="text-center text-white/40 text-sm py-10">No messages yet.</div>
                        )}
                        {activeThread.messages.map((msg) => {
                          const mine = msg.senderType === 'contractor';
                          return (
                            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                mine
                                  ? 'bg-miami-blue-light text-white rounded-br-md'
                                  : 'bg-white/10 border border-white/10 text-white rounded-bl-md'
                              }`}>
                                {!mine && (
                                  <p className="text-[0.6rem] mb-1 font-semibold text-white/50">{msg.senderName}</p>
                                )}
                                <p>{msg.body}</p>
                                {msg.calendarEventTitle && (
                                  <div className="mt-2 px-3 py-2 rounded-lg text-xs bg-white/15 text-white">
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
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:border-miami-blue-light focus:outline-none focus:ring-1 focus:ring-miami-blue-light"
                          />
                          <button
                            onClick={handleSend}
                            disabled={sending}
                            className="px-4 py-2 text-sm font-medium text-white bg-miami-blue-light hover:bg-miami-blue-light/80 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {sending ? 'Sending...' : 'Send'}
                          </button>
                        </div>
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