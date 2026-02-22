import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Paperclip, Loader2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export const AIChatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            // Call edge function securely
            const response = await supabase.functions.invoke('ai-proxy', {
                body: { query: userMessage.content }
            });

            if (response.error) throw new Error(response.error.message);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: response.data.response || "I couldn't find an answer to that."
            }]);
        } catch (error) {
            console.error("AI Proxy Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I ran into an issue connecting to the AI. Please try again."
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // Handle standard file upload to the Python backend
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Not authenticated");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("customer_id", session.user.id);

            // Post directly to the python backend for upload logic
            const res = await fetch("https://avicon-fastapi-backend.azurewebsites.net/upload/", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Upload failed");

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Successfully analyzed and ingested the document: ${file.name}`
            }]);

        } catch (err: any) {
            console.error(err);
            alert("Upload failed. Make sure you are logged in.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl relative transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-slate-100 font-semibold tracking-tight text-[15px]">Avicon RAG Knowledge Base</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Customer-Isolated Sandbox</p>
                    </div>
                </div>
                <label className="cursor-pointer group flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 rounded-full p-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none">
                    <input type="file" className="hidden" accept=".pdf,.docx,.xlsx" onChange={handleFileUpload} />
                    {isUploading ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <Upload className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />}
                    <span className="sr-only">Upload Document</span>
                </label>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/50 dark:bg-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm transition-colors duration-300">
                            <Paperclip className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">No documents indexed yet</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">Upload an RFP or project file to begin querying your secure architecture.</p>
                        </div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300 ease-out`}>
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-[14.5px] leading-relaxed transition-all ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50 rounded-bl-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                {isThinking && (
                    <div className="flex justify-start w-full animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center shadow-sm">
                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-px w-full" />
            </div>

            {/* Input Overlay */}
            <div className="p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="relative flex items-center group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about your project context..."
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded-full px-5 py-3.5 pr-14 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 shadow-sm"
                        disabled={isUploading}
                    />
                    <button
                        disabled={isThinking || !input.trim() || isUploading}
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 group-focus-within:shadow-md"
                        aria-label="Send message"
                    >
                        <Send className={`w-4 h-4 ${(!input.trim() || isThinking) ? 'text-slate-400 dark:text-slate-600' : 'text-white'} transition-colors ml-0.5`} />
                    </button>
                </div>
                <div className="mt-2 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">AI generated responses mapping directly to your authenticated workspace.</p>
                </div>
            </div>
        </div>
    );
};
