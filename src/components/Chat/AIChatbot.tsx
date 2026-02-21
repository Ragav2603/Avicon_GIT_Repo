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
            const res = await fetch("http://localhost:8000/upload/", {
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
        <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto rounded-2xl overflow-hidden glass-card border border-white/20 shadow-2xl relative bg-white/5 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary/80 animate-pulse-light"></div>
                    <div>
                        <h3 className="text-white font-medium text-lg">AI Knowledge Base</h3>
                        <p className="text-white/60 text-xs mt-0.5">Chat with your previous RFPs & Docs</p>
                    </div>
                </div>
                <label className="cursor-pointer group flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all rounded-full p-2.5">
                    <input type="file" className="hidden" accept=".pdf,.docx,.xlsx" onChange={handleFileUpload} />
                    {isUploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Upload className="w-5 h-5 text-white/80 group-hover:text-white" />}
                </label>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Paperclip className="w-8 h-8 text-white/40" />
                        </div>
                        <p className="text-white">Upload a document to start interacting with your personalized AI agent.</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white border border-white/5 backdrop-blur-md'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                {isThinking && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white/10 border border-white/5 backdrop-blur-md rounded-2xl px-5 py-4 flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/10">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about your RFPs..."
                        className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 pr-14 text-white placeholder:text-white/40 min-h-[52px] focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <button
                        disabled={isThinking || !input.trim()}
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};
