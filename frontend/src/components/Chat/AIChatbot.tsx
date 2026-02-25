import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Loader2, Bot, Sparkles, FileText, AlertCircle, ChevronDown, CheckCircle, Download, Copy, FileCode, Type } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from '../../integrations/supabase/client';
import { useProject } from '../../contexts/ProjectContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aavlayzfaafuwquhhbcx.supabase.co';
const BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || 'https://avicon-fastapi-backend.azurewebsites.net';

interface Source {
    source: string;
    snippet: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    reasoningLogs?: string[];
    sources?: Source[];
    isStreaming?: boolean;
}

export const AIChatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const { activeProject } = useProject();
    const projectId = activeProject?.id || '';
    const projectName = activeProject?.name || 'No Workspace Selected';

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

    const addMessage = (msg: Omit<Message, 'timestamp' | 'id'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setMessages(prev => [...prev, { ...msg, id, timestamp: new Date() }]);
        return id;
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const userQuery = input.trim();
        addMessage({ role: 'user', content: userQuery });
        setInput('');
        setIsThinking(true);

        const aiMessageId = addMessage({ role: 'assistant', content: '', reasoningLogs: [], isStreaming: true });

        try {
            const headers = await getAuthHeaders();

            const response = await fetch(`${BACKEND_URL}/query/`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: userQuery,
                    project_id: projectId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Request failed (${response.status})`);
            }

            const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
            if (!reader) throw new Error("Stream not readable");

            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (value) {
                    const lines = value.split('\n\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                setMessages(prev => prev.map(msg => {
                                    if (msg.id !== aiMessageId) return msg;

                                    if (data.type === 'status') {
                                        return { ...msg, reasoningLogs: [...(msg.reasoningLogs || []), data.data] };
                                    } else if (data.type === 'sources') {
                                        return { ...msg, sources: data.data };
                                    } else if (data.type === 'chunk') {
                                        return { ...msg, content: msg.content + data.data };
                                    } else if (data.type === 'done') {
                                        return { ...msg, isStreaming: false };
                                    }
                                    return msg;
                                }));
                            } catch (e) {
                                // Incomplete JSON string, mostly safe to ignore in naive SSE parser
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('Query error:', error);
            const errorMsg = error.message.includes('Not authenticated')
                ? 'Please sign in to use the AI assistant.'
                : `Sorry, I encountered an error: ${error.message}`;
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: errorMsg, isStreaming: false } : msg));
        } finally {
            setIsThinking(false);
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg));
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
            formData.append('project_id', projectId);

            const response = await fetch(`${BACKEND_URL}/upload/`, {
                method: 'POST',
                headers: {
                    'Authorization': headers['Authorization'],
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Upload failed (${response.status})`);
            }

            const data = await response.json();
            addMessage({
                role: 'assistant',
                content: `Document "${data.filename}" processed successfully.\n\n` +
                    `Knowledge chunks created and indexed to this project workspace.\n\n` +
                    `You can now ask questions about this document.`
            });

        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMsg = error.message.includes('Not authenticated')
                ? 'Please sign in to upload documents.'
                : `Upload failed: ${error.message}`;
            addMessage({ role: 'system', content: errorMsg });
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleExport = (content: string, format: 'markdown' | 'msword') => {
        let blob: Blob;
        let filename: string;

        if (format === 'markdown') {
            blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
            filename = `Response-${new Date().toISOString().slice(0, 10)}.md`;
        } else {
            // Basic HTML wrapper for MS Word format
            const wordContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Exported Response</title></head><body>
                ${content.replace(/\n/g, '<br/>')}
                </body></html>
            `;
            blob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
            filename = `Response-${new Date().toISOString().slice(0, 10)}.doc`;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported as ${format === 'markdown' ? 'Markdown' : 'Word Document'}`);
    };

    const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success("Copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy text: ', err);
            toast.error("Failed to copy text");
        }
    };

    // Component for Editable Text Area
    const EditableResponse = ({ initialContent, messageId }: { initialContent: string, messageId: string }) => {
        const [content, setContent] = useState(initialContent);

        // Update the main messages array whenever the user edits the content
        const handleBlur = () => {
            setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content } : msg));
        };

        return (
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleBlur}
                className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded min-h-[100px] text-slate-800 dark:text-slate-200"
            />
        );
    };

    return (
        <div className="flex flex-col h-[700px] w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-slate-100 font-bold text-base tracking-tight flex items-center gap-2">
                            Proposal Drafting AI
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 group cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-1 rounded transition-colors">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Workspace: {projectName}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                        </div>
                    </div>
                </div>
                <label
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                    aria-label="Upload document"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md"
                        onChange={handleFileUpload}
                        disabled={isUploading || !projectId}
                    />
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Add Context'}</span>
                </label>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/30">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-5">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Project Context Initialized
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Upload RFP documents, pricing matrices, or SLA requirements. The AI will extract requirements and draft responses with full source attribution.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className="flex flex-col gap-2">
                            {/* User Message */}
                            {msg.role === 'user' && (
                                <div className="self-end max-w-[85%] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm text-[15px] font-medium leading-relaxed">
                                    {msg.content}
                                </div>
                            )}

                            {/* Assistant Message */}
                            {msg.role === 'assistant' && (
                                <div className="self-start max-w-[95%] w-full">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-1 border border-blue-200 dark:border-blue-800">
                                            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden flex flex-col">

                                            {/* Reasoning Trace Section */}
                                            {msg.reasoningLogs && msg.reasoningLogs.length > 0 && (
                                                <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Loader2 className={`w-3.5 h-3.5 text-blue-500 ${msg.isStreaming ? 'animate-spin' : 'hidden'}`} />
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Reasoning Trace</span>
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {msg.reasoningLogs.map((log, idx) => (
                                                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                <span className="leading-snug">{log}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Final Content Editable Area */}
                                            <div className="p-5">
                                                {msg.isStreaming && !msg.content ? (
                                                    <div className="flex gap-1.5 items-center h-6">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
                                                    </div>
                                                ) : (
                                                    <EditableResponse initialContent={msg.content} messageId={msg.id} />
                                                )}
                                            </div>

                                            {/* Utilities Footer */}
                                            {!msg.isStreaming && msg.content && (
                                                <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleCopy(msg.content)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                                                        title="Copy text"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                        Copy
                                                    </button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                                                                title="Export Response"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                Export
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleExport(msg.content, 'markdown')} className="cursor-pointer">
                                                                <FileCode className="w-4 h-4 mr-2 text-slate-500" />
                                                                <span>Markdown (.md)</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleExport(msg.content, 'msword')} className="cursor-pointer">
                                                                <Type className="w-4 h-4 mr-2 text-slate-500" />
                                                                <span>MS Word (.doc)</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}

                                            {/* Source Attribution */}
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="bg-amber-50/50 dark:bg-amber-900/10 px-5 py-3 border-t border-amber-100 dark:border-amber-900/30">
                                                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-2 block">Sources Extracted From</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.sources.map((src, i) => (
                                                            <div key={i} className="px-2 py-1 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shadow-sm" title={src.snippet}>
                                                                <FileText className="w-3 h-3 text-amber-600" />
                                                                {src.source}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* System Errors */}
                            {msg.role === 'system' && (
                                <div className="mx-auto flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-medium border border-red-100 dark:border-red-900/50">
                                    <AlertCircle className="w-4 h-4" />
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {uploadProgress && (
                    <div className="flex justify-center">
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 shadow-sm">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {uploadProgress}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-sm">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Generate response for section 2.1..."
                        className="w-full bg-transparent border-none px-4 py-3.5 pr-14 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none min-h-[50px] max-h-[150px]"
                        disabled={isUploading || isThinking}
                        rows={1}
                    />
                    <button
                        disabled={isThinking || !input.trim() || isUploading || !projectId}
                        onClick={handleSendMessage}
                        className="absolute right-2 bottom-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 w-9 h-9 rounded-lg flex items-center justify-center transition-colors shadow-sm focus:outline-none"
                    >
                        <Send className={`w-4 h-4 ${(!input.trim() || isThinking || isUploading || !projectId) ? 'text-slate-400 dark:text-slate-500' : 'text-white'}`} />
                    </button>
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500">Return</kbd> to send, <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500">Shift + Return</kbd> for new line
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        Responses are editable
                    </p>
                </div>
            </div>
        </div>
    );
};
