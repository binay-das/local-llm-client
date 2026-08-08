"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { Message } from '@/types';

export const ChatContainer: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
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

    // Restore persisted message history whenever the active chat changes
    useEffect(() => {
        if (!activeChatId) {
            setMessages([]);
            setIsLoadingChat(false);
            return;
        }

        // Clear stale messages immediately so the old chat never flashes
        setMessages([]);
        setIsLoadingChat(true);

        const fetchSelectedChat = async () => {
            try {
                const res = await fetch(`/api/chats/${activeChatId}`);
                if (res.ok) {
                    const data = await res.json();
                    // Normalise role casing from DB (stored as 'USER' / 'ASSISTANT')
                    const formattedMessages = (data.messages || []).map((m: any) => ({
                        id: m.id,
                        role: (m.role as string).toLowerCase() as Message['role'],
                        content: m.content,
                        createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
                    }));
                    setMessages(formattedMessages);
                    // Restore the model that was used in this chat
                    if (data.modelId) {
                        setSelectedModel(data.modelId);
                    }
                } else {
                    console.error("Failed to load chat:", res.status);
                }
            } catch (err) {
                console.error("Failed to load chat", err);
            } finally {
                setIsLoadingChat(false);
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

            // Add the assistant placeholder only once we have a live stream
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

    const modelShortName = selectedModel ? selectedModel.split(':')[0] : '';

    return (
        <div className="flex h-screen w-full bg-[#0d0f11]">
            <Sidebar
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                activeChatId={activeChatId}
                onSelectChat={setActiveChatId}
                onNewChat={handleNewChat}
            />

            {/* Main chat area */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative">

                {/* Copy toast */}
                <div className={`fixed right-5 top-5 z-50 px-4 py-2.5 rounded-xl text-xs font-medium bg-[#1f2327] border border-[#2e3238] text-[#a5b4fc] shadow-xl transition-all duration-200 ${showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    ✓ Copied to clipboard
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-24 xl:px-32">
                    <MessageList
                        messages={messages}
                        copiedMessageIndex={copiedMessageIndex}
                        isGenerating={isGenerating}
                        onCopyMessage={handleCopyMessage}
                        selectedModel={selectedModel}
                    />
                </div>

                {/* Input area */}
                <div className="px-6 pb-4 md:px-12 lg:px-24 xl:px-32 shrink-0">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={isGenerating || isLoadingChat || !selectedModel}
                        placeholder={
                            isLoadingChat
                                ? 'Loading conversation...'
                                : modelShortName
                                    ? `Message ${modelShortName}...`
                                    : 'Select a model to start...'
                        }
                    />
                    <p className="text-center text-[10px] text-[#374151] mt-2.5">
                        Local Inference via Ollama. Responses are generated on your device.
                    </p>
                </div>
            </div>
        </div>
    );
};