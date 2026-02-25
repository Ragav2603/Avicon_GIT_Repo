import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Loader2, Bot, User, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aavlayzfaafuwquhhbcx.supabase.co';
const BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || 'https://avicon-fastapi-backend.azurewebsites.net';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export const AIChatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getAuthHeaders = async (): Promise<Record<string, string>> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }
        return {
            'Authorization': `Bearer ${session.access_token}`,
        };
    };

    const addMessage = (role: Message['role'], content: string) => {
        setMessages(prev => [...prev, {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            role,
            content,
            timestamp: new Date(),
        }]);
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const userQuery = input.trim();
        addMessage('user', userQuery);
        setInput('');
        setIsThinking(true);

        try {
            const headers = await getAuthHeaders();

            // Direct call to verified Azure backend
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${BACKEND_URL}/query/`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: userQuery,
                    customer_id: session?.user?.id // Identity passed to RAG engine
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Request failed (${response.status})`);
            }

            const data = await response.json();

            const latencyInfo = data.latency_ms ? ` (${data.latency_ms}ms${data.cached ? ', cached' : ''})` : '';
            addMessage('assistant', data.response + (latencyInfo ? `\n\n_${latencyInfo}_` : ''));

        } catch (error: any) {
            console.error('Query error:', error);
            const errorMsg = error.message === 'Not authenticated'
                ? 'Please sign in to use the AI assistant.'
                : `Sorry, I encountered an error: ${error.message}`;
            addMessage('system', errorMsg);
        } finally {
            setIsThinking(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(`Uploading ${file.name}...`);

        try {
            const headers = await getAuthHeaders();

            const formData = new FormData();
            formData.append('file', file);

            // Route through Supabase edge function for secure identity injection
            const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': headers['Authorization'],
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.error || `Upload failed: ${response.statusText}`);
            }

            const data = await response.json();

            addMessage('assistant',
                `Document "${data.filename}" processed successfully.\n\n` +
                `**${data.chunks_created}** knowledge chunks created and indexed in your secure namespace.\n\n` +
                `You can now ask questions about this document.`
            );

        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMsg = error.message === 'Not authenticated'
                ? 'Please sign in to upload documents.'
                : `Upload failed: ${error.message}`;
            addMessage('system', errorMsg);
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-sm tracking-tight">
                            Avicon Knowledge Base
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <p className="text-slate-500 dark:text-slate-400 text-xs">
                                Multi-tenant RAG &middot; Namespace Isolated
                            </p>
                        </div>
                    </div>
                </div>
                <label
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-within:ring-2 focus-within:ring-blue-500"
                    aria-label="Upload document"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                    {isUploading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                        : <Upload className="w-3.5 h-3.5" />
                    }
                    <span className="hidden sm:inline">{isUploading ? 'Processing...' : 'Upload'}</span>
                </label>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-1.5 max-w-xs">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Your secure AI workspace
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Upload RFP documents or project files to build your private knowledge base.
                                All data is isolated to your tenant namespace.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${msg.role === 'user'
                                ? 'bg-blue-600'
                                : msg.role === 'system'
                                    ? 'bg-amber-100 dark:bg-amber-900'
                                    : 'bg-slate-100 dark:bg-slate-800'
                                }`}>
                                {msg.role === 'user'
                                    ? <User className="w-3.5 h-3.5 text-white" />
                                    : msg.role === 'system'
                                        ? <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        : <Bot className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                                }
                            </div>
                            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : msg.role === 'system'
                                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                {isThinking && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                {uploadProgress && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                            <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                            {uploadProgress}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Ask about your project context..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                        disabled={isUploading || isThinking}
                        aria-label="Type your question"
                    />
                    <button
                        disabled={isThinking || !input.trim() || isUploading}
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 w-8 h-8 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Send message"
                    >
                        <Send className={`w-3.5 h-3.5 ${(!input.trim() || isThinking) ? 'text-slate-400' : 'text-white'}`} />
                    </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
                    Responses are scoped to your authenticated workspace &middot; PII auto-redacted
                </p>
            </div>
        </div>
    );
};
