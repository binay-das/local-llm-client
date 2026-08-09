"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { Message } from '@/types';
import { PanelLeft } from 'lucide-react';

export const ChatContainer: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [showCopyToast, setShowCopyToast] = useState(false);
    const copyResetTimeoutRef = useRef<number | null>(null);
    const toastTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (copyResetTimeoutRef.current) {
                window.clearTimeout(copyResetTimeoutRef.current);
            }
            if (toastTimeoutRef.current) {
                window.clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    const fetchSelectedChat = useCallback(async (chatId: string) => {
        try {
            const res = await fetch(`/api/chats/${chatId}`);
            if (res.ok) {
                const data = await res.json();
                const formattedMessages = (data.messages || []).map((m: any) => ({
                    id: m.id,
                    role: (m.role as string).toLowerCase() as Message['role'],
                    content: m.content,
                    createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
                }));
                setMessages(formattedMessages);
                if (data.modelId) {
                    setSelectedModel(data.modelId);
                }
            } else {
                console.error("Failed to load chat:", res.status);
            }
        } catch (err) {
            console.error("Failed to load chat", err);
        }
    }, []);

    // Restore persisted message history whenever the active chat changes
    useEffect(() => {
        if (!activeChatId) {
            setMessages([]);
            setIsLoadingChat(false);
            return;
        }

        setMessages([]);
        setIsLoadingChat(true);

        fetchSelectedChat(activeChatId).finally(() => {
            setIsLoadingChat(false);
        });
    }, [activeChatId, fetchSelectedChat]);

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([]);
    };

    const handleSendMessage = async (content: string) => {
        if (!selectedModel) {
            alert('Please select a model first');
            return;
        }

        let currentChatId = activeChatId;

        if (!currentChatId) {
            try {
                const res = await fetch('/api/chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
                        modelId: selectedModel,
                        modelName: selectedModel
                    })
                });
                if (res.ok) {
                    const newChat = await res.json();
                    currentChatId = newChat.id;
                    setActiveChatId(newChat.id);
                }
            } catch (e) {
                console.error("Failed to create chat", e);
                return;
            }
        }

        const userMessage: Message = { role: 'user', content };
        setMessages((prev) => [...prev, userMessage]);
        setIsGenerating(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: currentChatId,
                    model: selectedModel,
                    prompt: content,
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            if (!response.body) throw new Error('No response body stream available');

            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: updated[lastIndex].content + chunk
                    };
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error fetching stream:', error);
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.content === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            setIsGenerating(false);
            if (currentChatId) {
                await fetchSelectedChat(currentChatId);
            }
        }
    };

    const handleEditMessage = async (message: Message, index: number, newContent: string) => {
        if (!selectedModel || !activeChatId || isGenerating) return;

        setMessages((prev) => {
            const truncated = prev.slice(0, index + 1);
            truncated[index] = { ...truncated[index], content: newContent };
            return truncated;
        });

        setIsGenerating(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: activeChatId,
                    model: selectedModel,
                    action: 'edit',
                    messageId: message.id,
                    prompt: newContent,
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            if (!response.body) throw new Error('No response body stream available');

            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: updated[lastIndex].content + chunk
                    };
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error in edit stream:', error);
        } finally {
            setIsGenerating(false);
            if (activeChatId) {
                await fetchSelectedChat(activeChatId);
            }
        }
    };

    const handleRegenerateMessage = async (message: Message, index: number) => {
        if (!selectedModel || !activeChatId || isGenerating) return;

        setMessages((prev) => prev.slice(0, index));
        setIsGenerating(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: activeChatId,
                    model: selectedModel,
                    action: 'regenerate',
                    messageId: message.id,
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            if (!response.body) throw new Error('No response body stream available');

            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: updated[lastIndex].content + chunk
                    };
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error in regenerate stream:', error);
        } finally {
            setIsGenerating(false);
            if (activeChatId) {
                await fetchSelectedChat(activeChatId);
            }
        }
    };

    const handleCopyMessage = async (message: Message, index: number) => {
        if (!message.content.trim()) return;
        try {
            await navigator.clipboard.writeText(message.content);
            setCopiedMessageIndex(index);
            setShowCopyToast(true);

            if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
            if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);

            copyResetTimeoutRef.current = window.setTimeout(() => setCopiedMessageIndex(null), 2200);
            toastTimeoutRef.current = window.setTimeout(() => setShowCopyToast(false), 2200);
        } catch (error) {
            console.error('Error copying message:', error);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white dark:bg-[#0f1115] text-slate-900 dark:text-white transition-colors duration-200 overflow-hidden">
            <Sidebar
                activeChatId={activeChatId}
                onSelectChat={setActiveChatId}
                onNewChat={handleNewChat}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex-1 flex flex-col h-full min-w-0 relative">
                {/* Floating Sidebar Toggle when closed or on mobile */}
                {!isSidebarOpen && (
                    <div className="absolute top-4 left-4 z-40">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-[#1c1f24] hover:bg-slate-200 dark:hover:bg-[#272b32] border border-slate-200 dark:border-[#2e3238] text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
                            title="Open sidebar"
                        >
                            <PanelLeft size={18} />
                        </button>
                    </div>
                )}

                <div className={`fixed right-5 top-5 z-50 px-4 py-2.5 rounded-2xl text-xs font-medium bg-slate-800 dark:bg-[#1f2327] border border-slate-700 dark:border-[#2e3238] text-slate-200 dark:text-slate-200 shadow-xl transition-all duration-200 ${showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    Copied to clipboard
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 md:px-16 lg:px-32 xl:px-44">
                    <MessageList
                        messages={messages}
                        copiedMessageIndex={copiedMessageIndex}
                        isGenerating={isGenerating}
                        onCopyMessage={handleCopyMessage}
                        onEditMessage={handleEditMessage}
                        onRegenerateMessage={handleRegenerateMessage}
                        selectedModel={selectedModel}
                    />
                </div>

                <div className="px-4 pb-6 md:px-16 lg:px-32 xl:px-44 shrink-0">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={isGenerating || isLoadingChat || !selectedModel}
                        placeholder="Send a message"
                        selectedModel={selectedModel}
                        onSelectModel={setSelectedModel}
                    />
                </div>
            </div>
        </div>
    );
};