"use client";

import React, { useEffect, useRef } from 'react';
import { Copy, Check, Bot } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Message } from '@/types';

interface MessageListProps {
    messages: Message[];
    copiedMessageIndex: number | null;
    isGenerating: boolean;
    onCopyMessage: (message: Message, index: number) => void;
    selectedModel?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    copiedMessageIndex,
    isGenerating,
    onCopyMessage,
    selectedModel,
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const modelShortName = selectedModel ? selectedModel.split(':')[0] : 'AI';

    if (messages.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center px-6 select-none">
                {/* Bot icon circle */}
                <div className="w-14 h-14 rounded-full bg-[#1f2327] border border-[#2e3238] flex items-center justify-center mb-6 shadow-lg">
                    <Bot size={26} className="text-[#6366f1]" />
                </div>
                <h2 className="text-[2.1rem] font-bold text-white leading-tight tracking-tight mb-3">
                    How can I help you today?
                </h2>
                <p className="text-sm text-[#6b7280] max-w-md leading-relaxed">
                    I&apos;m ready to assist with coding, writing, analyzing data, or brainstorming.
                    I am running locally on your machine via Ollama.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 py-2">
            {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const isStreamingAssistant = isGenerating && !isUser && index === messages.length - 1;
                const canCopy = msg.content.trim().length > 0 && !isStreamingAssistant;

                if (isUser) {
                    return (
                        <div key={index} className="flex justify-end">
                            <div className="max-w-[70%] bg-[#1f2327] border border-[#2e3238] rounded-2xl rounded-tr-md px-4 py-3 text-sm text-[#e5e7eb] leading-relaxed">
                                {msg.content}
                            </div>
                        </div>
                    );
                }

                // Assistant message
                return (
                    <div key={index} className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                            <Bot size={15} className="text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Model name */}
                            <p className="text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wide">
                                {modelShortName}
                            </p>

                            {/* Content */}
                            <div className="text-sm text-[#d1d5db] leading-relaxed">
                                {msg.content.trim() === '' && isStreamingAssistant ? (
                                    <div className="flex gap-1 items-center py-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-bounce [animation-delay:300ms]" />
                                    </div>
                                ) : (
                                    <MarkdownRenderer content={msg.content} />
                                )}
                            </div>

                            {/* Copy button */}
                            {canCopy && (
                                <button
                                    onClick={() => onCopyMessage(msg, index)}
                                    className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#4b5563] hover:text-[#9ca3af] transition-colors"
                                >
                                    {copiedMessageIndex === index
                                        ? <><Check size={12} /> Copied</>
                                        : <><Copy size={12} /> Copy</>
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};