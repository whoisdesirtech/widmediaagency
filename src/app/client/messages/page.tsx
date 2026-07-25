'use client';

import React, { useEffect, useState } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

const CONVERSATIONS = [
  {
    id: 1,
    name: 'Website Redesign',
    icon: '🌐',
    lastMessage: 'The homepage mockups are ready for your review.',
    time: '2h ago',
    unread: 2,
    messages: [
      { sender: 'agency', text: 'Hi! We\'ve started working on the homepage redesign.', time: '10:00 AM' },
      { sender: 'client', text: 'Great! Can we make sure the hero section is above the fold?', time: '10:15 AM' },
      { sender: 'agency', text: 'Absolutely. We\'ll adjust the layout accordingly.', time: '10:20 AM' },
      { sender: 'agency', text: 'The homepage mockups are ready for your review.', time: '2:00 PM' },
    ],
  },
  {
    id: 2,
    name: 'Brand Photoshoot',
    icon: '📸',
    lastMessage: 'Location options have been sent to your email.',
    time: '1d ago',
    unread: 0,
    messages: [
      { sender: 'agency', text: 'We\'re finalizing locations for the photoshoot. Any preferences?', time: 'Yesterday 9:00 AM' },
      { sender: 'client', text: 'Something with a clean, modern aesthetic would be perfect.', time: 'Yesterday 9:30 AM' },
      { sender: 'agency', text: 'Location options have been sent to your email.', time: 'Yesterday 4:00 PM' },
    ],
  },
  {
    id: 3,
    name: 'Social Media Content',
    icon: '📱',
    lastMessage: 'Can we move the hero image higher?',
    time: '3d ago',
    unread: 0,
    messages: [
      { sender: 'client', text: 'Can we move the hero image higher?', time: '3 days ago' },
      { sender: 'agency', text: 'Absolutely.', time: '3 days ago' },
    ],
  },
];

export default function ClientMessagesPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeConvo, setActiveConvo] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { window.location.href = '/login'; return; }
    setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <ClientSidebar user={user || undefined} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black text-dark-800">Messages</h1>
            <p className="text-muted text-sm mt-1">Simple chat — no more long email chains</p>
          </div>

          <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex h-full">
              {/* Conversation List */}
              <div className="w-80 border-r border-muted-lighter flex flex-col">
                <div className="p-4 border-b border-muted-lighter">
                  <h3 className="font-heading font-bold text-dark-800 text-sm">Conversations</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {CONVERSATIONS.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => setActiveConvo(convo)}
                      className={`w-full p-4 text-left border-b border-muted-lighter/50 hover:bg-white/50 transition-colors ${activeConvo?.id === convo.id ? 'bg-miami-pink/5 border-l-2 border-l-miami-pink' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{convo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-dark-800">{convo.name}</span>
                            <span className="text-[0.6rem] text-muted">{convo.time}</span>
                          </div>
                          <p className="text-xs text-muted truncate mt-0.5">{convo.lastMessage}</p>
                        </div>
                        {convo.unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-miami-pink text-white text-[0.6rem] font-bold flex items-center justify-center flex-shrink-0">
                            {convo.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {activeConvo ? (
                  <>
                    <div className="p-4 border-b border-muted-lighter flex items-center gap-3">
                      <span className="text-xl">{activeConvo.icon}</span>
                      <span className="font-heading font-bold text-dark-800 text-sm">{activeConvo.name}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {activeConvo.messages.map((msg: any, i: number) => (
                        <div key={i} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            msg.sender === 'client'
                              ? 'bg-miami-pink text-white rounded-br-md'
                              : 'bg-white border border-muted-lighter text-dark-800 rounded-bl-md'
                          }`}>
                            <p>{msg.text}</p>
                            <p className={`text-[0.6rem] mt-1 ${msg.sender === 'client' ? 'text-white/60' : 'text-muted'}`}>{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-muted-lighter">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-muted-lighter bg-white text-dark-800 text-sm"
                        />
                        <button className="btn-primary px-6">Send</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted text-sm">
                    Select a conversation to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
