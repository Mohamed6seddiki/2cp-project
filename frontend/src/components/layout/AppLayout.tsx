import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';

export const AppLayout: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Hi! I am your Algonova chat assistant. How can I help today?' },
  ]);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isPublicPage =
    !isAuthenticated || location.pathname === '/' || location.pathname.startsWith('/auth');

  // If public page, we render a different layout
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col selection:bg-primary/30">
        <Navbar />
        <main className="flex-1 flex flex-col relative w-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="min-h-screen bg-background text-text flex flex-col selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 lg:p-10">
          <Outlet />
        </div>
      </main>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#00e5cc] px-5 py-3 text-sm font-bold text-[#0f1117] shadow-[0_12px_30px_rgba(0,229,204,0.3)] transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle size={18} />
          <span>Open Chat</span>
        </button>
      )}

      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 md:p-6">
          <div className="ml-auto flex h-full max-h-[560px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-bold text-[#00e5cc]">Algonova AI Chat</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'ml-auto bg-[#00e5cc]/20 text-text'
                      : 'bg-surface text-text-muted'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <form
              className="border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                const next = chatInput.trim();
                if (!next) return;
                setMessages((prev) => [
                  ...prev,
                  { sender: 'user', text: next },
                  { sender: 'assistant', text: 'Thanks! This is a demo chat modal. Backend AI integration can be plugged here.' },
                ]);
                setChatInput('');
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask anything..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-[#00e5cc]"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#00e5cc] text-[#0f1117] transition-colors hover:bg-[#00cbb4]"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
