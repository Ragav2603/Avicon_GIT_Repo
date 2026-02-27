import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, FileText, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aavlayzfaafuwquhhbcx.supabase.co';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://avicon-fastapi-backend.azurewebsites.net';
// Bypass Edge Function proxy completely due to Docker dependencies, hit python API natively
const API = BACKEND_URL;

interface ContextualChatProps {
  selectedDocIds: string[];
  selectedDocNames: string[];
  onDeselectDoc: (docId: string) => void;
}

export default function ContextualChat({ selectedDocIds, selectedDocNames, onDeselectDoc }: ContextualChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const query = input.trim();

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: query }]);
    setInput('');
    setIsThinking(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const res = await fetch(`${API}/api/rfp-response/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhdmxheXpmYWFmdXdxdWhoYmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDMyNTcsImV4cCI6MjA4NDIxOTI1N30.gst2u0jgQmlewK8FaQFNlVI_q4_CvFJTYytuiLbR55k',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          document_ids: selectedDocIds,
          session_id: sessionId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSessionId(data.session_id);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
        }]);
      } else {
        throw new Error(data.detail || 'Query failed');
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div data-testid="contextual-chat" className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Contextual AI Chat</h3>
        {selectedDocIds.length > 0 && (
          <Badge variant="secondary" className="text-[10px] h-5" data-testid="chat-docs-badge">
            {selectedDocIds.length} docs selected
          </Badge>
        )}
      </div>

      {/* Selected docs pills */}
      {selectedDocIds.length > 0 && (
        <div className="px-4 py-2 border-b border-border/30 flex flex-wrap gap-1.5">
          {selectedDocNames.map((name, i) => (
            <Badge key={selectedDocIds[i]} variant="outline" className="text-[10px] h-6 gap-1 pl-2">
              <FileText className="h-2.5 w-2.5" />
              {name.length > 25 ? name.slice(0, 25) + '...' : name}
              <button onClick={() => onDeselectDoc(selectedDocIds[i])} className="ml-0.5 hover:text-destructive">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot className="h-10 w-10 text-muted-foreground/15 mb-3" />
            <p className="text-sm text-muted-foreground">Ask questions about selected documents</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Select documents from the KB, then ask targeted questions</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-muted'
              }`}>
              {msg.role === 'user'
                ? <User className="h-3.5 w-3.5 text-primary-foreground" />
                : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              }
            </div>
            <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3 flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={selectedDocIds.length > 0 ? 'Ask about selected documents...' : 'Select documents first...'}
            className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isThinking}
            aria-label="Chat message input"
            data-testid="chat-message-input"
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-primary hover:bg-primary/90 disabled:bg-muted flex items-center justify-center transition-colors"
            aria-label="Send message"
            data-testid="chat-send-btn"
          >
            <Send className={`h-3.5 w-3.5 ${input.trim() && !isThinking ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
