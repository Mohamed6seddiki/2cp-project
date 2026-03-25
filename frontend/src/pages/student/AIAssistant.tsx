import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Code2, History, HelpCircle, FileText, Zap } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your MyAlgo Assistant. I can help you understand algorithms, debug your code, or give you hints. What are you working on today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "That's a great question about Dijkstra's algorithm. Let's break it down step by step without giving away the full solution. First, remember that we need a priority queue to always pick the lowest-cost edge. How might you initialize that queue?" 
      }]);
    }, 1000);
  };

  const shortcuts = [
    { icon: HelpCircle, label: 'Explain Algorithm' },
    { icon: Code2, label: 'Debug My Code' },
    { icon: Zap, label: 'Give a Hint' },
    { icon: FileText, label: 'Simplify Lesson' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Sidebar: History & Shortcuts */}
      <Card className="hidden lg:flex flex-col w-80 shrink-0 border-border bg-surface">
        <div className="p-4 border-b border-border bg-surface-hover">
          <Button variant="primary" fullWidth className="gap-2">
            <Sparkles size={18} /> New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Topic Shortcuts</h3>
            <div className="space-y-2">
              {shortcuts.map((s, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-2 rounded hover:bg-surface-hover text-text-muted hover:text-text transition-colors text-sm text-left">
                  <s.icon size={16} className="text-primary" /> {s.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <History size={14} /> Recent Chats
            </h3>
            <div className="space-y-1">
              {['Understanding BFS Queues', 'Help with Two Pointers', 'Graph representation'].map((chat, i) => (
                <div key={i} className="p-2 rounded hover:bg-surface-hover cursor-pointer text-sm truncate text-text-muted hover:text-text">
                  {chat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col border-border bg-background border-t-2 border-t-primary shadow-glow overflow-hidden relative">
        {/* Context Chip */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="primary" className="shadow-lg backdrop-blur bg-primary/10">Linked to: Dijkstra's Algorithm</Badge>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'ai' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'ai' ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-surface-hover text-text-muted border border-border'
              }`}>
                {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                msg.role === 'ai' 
                  ? 'bg-surface border border-border rounded-tl-none' 
                  : 'bg-primary text-secondary font-medium rounded-tr-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-surface">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-background border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 rounded-xl p-2 transition-all">
            <button type="button" title="Insert code context" className="p-2 text-text-muted hover:text-primary transition-colors">
              <Code2 size={20} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for help with algorithms, exercises, or MyAlgo code..."
              className="flex-1 max-h-32 min-h-10 bg-transparent resize-none border-none focus:outline-none p-2 text-text"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <Button type="submit" size="sm" className="h-10 w-10 p-0 rounded-lg shrink-0 gap-0 border-transparent">
              <Send size={18} className="translate-x-0.5" />
            </Button>
          </form>
          <div className="max-w-4xl mx-auto mt-2 text-center">
             <p className="text-xs text-text-muted">AI can make mistakes. Consider verifying concepts.</p>
          </div>
        </div>
      </Card>
      
    </div>
  );
};

export default AIAssistant;
