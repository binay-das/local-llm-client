"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Message } from '@/types';

export const ChatContainer: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [showCopyToast, setShowCopyToast] = useState(false);
    const copyResetTimeoutRef = useRef<number | null>(null);
    const toastTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
            if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    // fetch messages when activeChatId changes
    useEffect(() => {
        if (!activeChatId) {
            setMessages([]);
            return;
        }

        const fetchSelectedChat = async () => {
            try {
                const res = await fetch(`/api/chats/${activeChatId}`);
                if (res.ok) {
                    const data = await res.json();
                    const formattedMessages = (data.messages || []).map((m: any) => ({
                        ...m,
                        role: m.role ? m.role.toLowerCase() : 'user'
                    }));
                    setMessages(formattedMessages);
                    if (data.modelId) {
                        setSelectedModel(data.modelId);
                    }
                }
            } catch (err) {
                console.error("Failed to load chat", err);
            }
        };

        fetchSelectedChat();
    }, [activeChatId]);

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

        // create new chat if this is the first message
        if (!currentChatId) {
            try {
                const res = await fetch('/api/chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
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
        const initialMessages = [...messages, userMessage];
        setMessages(initialMessages);
        setIsGenerating(true);

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: currentChatId,
                    model: selectedModel,
                    messages: messages.map(m => ({ role: m.role, content: m.content })),
                    prompt: content,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body stream available');
            }

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
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: 'Error: Failed to connect or generate response.'
                };
                return updated;
            });
        } finally {
            setIsGenerating(false);
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
        <div className="flex h-screen w-full bg-linear-to-br from-[#f6f4ef] via-[#faf8f3] to-[#e8e4db] dark:bg-linear-to-br dark:from-[#0d1014] dark:via-[#13171d] dark:to-[#0a0c0f]">
            <Sidebar 
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                activeChatId={activeChatId}
                onSelectChat={setActiveChatId}
                onNewChat={handleNewChat}
            />

            <div className="flex-1 flex flex-col h-full relative min-w-0 bg-[#fffcf7]/40 dark:bg-[#101218]/60 backdrop-blur-sm">
                <Header />

                <div className={`fixed right-4 top-4 z-80 rounded-2xl px-4 py-3 text-sm font-medium md:right-6 transition-all duration-200 ${showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'} bg-linear-to-br from-[#f0f8f2] to-[#e2f1e8] dark:from-[#1a2c22] dark:to-[#131f1a] border border-[#d6e1d8] dark:border-[#394e41] text-[#275c3e] dark:text-[#a5dcb9] shadow-lg dark:shadow-xl`}>
                    Copied to clipboard
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
                    <MessageList
                        messages={messages}
                        copiedMessageIndex={copiedMessageIndex}
                        isGenerating={isGenerating}
                        onCopyMessage={handleCopyMessage}
                    />
                </div>

                <div className="p-4 md:p-6 shrink-0">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={isGenerating || !selectedModel}
                    />
                </div>
            </div>
        </div>
    );
};