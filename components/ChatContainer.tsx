"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ModelSelector } from './ModelSelector';
import { Header } from './Header';
import { Message } from '@/types';

export const ChatContainer: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('');
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

    const handleSendMessage = async (content: string) => {
        if (!selectedModel) {
            alert('Please select a model first');
            return;
        }

        const userMessage: Message = { role: 'user', content };
        const initialMessages = [...messages, userMessage];
        setMessages(initialMessages);
        setIsGenerating(true);


        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: initialMessages,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body stream available');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('\n').filter((line) => line.trim() !== '');

                for (const line of lines) {
                    const parsed = JSON.parse(line);
                    if (parsed.message?.content) {
                        setMessages((prev) => {
                            const updated = [...prev];
                            const lastIndex = updated.length - 1;
                            updated[lastIndex] = {
                                ...updated[lastIndex],
                                content: updated[lastIndex].content + parsed.message.content
                            };
                            return updated;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching from local LLM:', error);
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
        if (!message.content.trim()) {
            return;
        }

        try {
            await navigator.clipboard.writeText(message.content);
            setCopiedMessageIndex(index);
            setShowCopyToast(true);

            if (copyResetTimeoutRef.current) {
                window.clearTimeout(copyResetTimeoutRef.current);
            }
            if (toastTimeoutRef.current) {
                window.clearTimeout(toastTimeoutRef.current);
            }

            copyResetTimeoutRef.current = window.setTimeout(() => {
                setCopiedMessageIndex(null);
            }, 2200);

            toastTimeoutRef.current = window.setTimeout(() => {
                setShowCopyToast(false);
            }, 2200);
        } catch (error) {
            console.error('Error copying message:', error);
        }
    };

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-[#f6f4ef] via-[#faf8f3] to-[#e8e4db] dark:bg-gradient-to-br dark:from-[#0d1014] dark:via-[#13171d] dark:to-[#0a0c0f]">
            <div className="hidden md:flex flex-col w-72 p-5 shrink-0 bg-gradient-to-b from-[#faf8f3] to-[#f0ece3] dark:from-[#191d23] dark:to-[#0f1115] border-r border-[#ded8cb] dark:border-[#303338] text-[#212731] dark:text-[#dcd8d4]">
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#7e6a4f] dark:text-[#9c896f]">Workspace</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#171d25] dark:text-[#f4efe8]">Studio</h2>
                    <p className="mt-2 text-sm leading-6 text-[#595c66] dark:text-[#9a9a9c]">
                        Pick a local model and keep the conversation flowing in a calmer, sharper workspace.
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ModelSelector
                        selectedModel={selectedModel}
                        onSelectModel={setSelectedModel}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col h-full relative min-w-0 bg-[#fffcf7]/40 dark:bg-[#101218]/60 backdrop-blur-sm">
                <Header />

                <div className={`fixed right-4 top-4 z-80 rounded-2xl px-4 py-3 text-sm font-medium md:right-6 transition-all duration-200 ${showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'} bg-gradient-to-br from-[#f0f8f2] to-[#e2f1e8] dark:from-[#1a2c22] dark:to-[#131f1a] border border-[#d6e1d8] dark:border-[#394e41] text-[#275c3e] dark:text-[#a5dcb9] shadow-lg dark:shadow-xl`}>
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