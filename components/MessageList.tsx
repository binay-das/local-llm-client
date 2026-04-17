"use client";

import React, { useEffect, useRef } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Message } from '@/types';

interface MessageListProps {
    messages: Message[];
    copiedMessageIndex: number | null;
    isGenerating: boolean;
    onCopyMessage: (message: Message, index: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, copiedMessageIndex, isGenerating, onCopyMessage }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="mx-auto flex max-w-2xl flex-col items-start justify-center rounded-[2.5rem] p-8 md:p-10 bg-gradient-to-br from-[#fffcf8] to-[#f7f2ea] dark:from-[#1b1f26] dark:to-[#13161b] border border-[#e4dccf] dark:border-[#393d43] shadow-xl dark:shadow-2xl">
                    <span className="text-xs uppercase tracking-[0.28em] text-[#7c684f] dark:text-[#bca68b]">Ready</span>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1b1f25] dark:text-[#f4efe8] md:text-4xl">
                        Start a conversation that stays on your machine.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#5f6169] dark:text-[#9d9c9a] md:text-base">
                        Choose a model from the left, ask a question, and this workspace will stream the response into a cleaner chat view.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {messages.map((msg, index) => {
                const isStreamingAssistant = isGenerating && msg.role === 'assistant' && index === messages.length - 1;
                const canCopy = msg.content.trim().length > 0 && !isStreamingAssistant;

                return (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[85%] flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`w-full px-5 py-3.5 transition-all duration-200 ${msg.role === 'user'
                                    ? 'rounded-[1.6rem] rounded-br-md text-white bg-gradient-to-br from-[#3a4a5e] to-[#212a35] dark:from-[#83694e] dark:to-[#5a4634] shadow-lg dark:shadow-xl'
                                    : 'rounded-[1.6rem] rounded-bl-md border bg-gradient-to-br from-[#eecf9c] to-[#eee7dc] dark:from-[#272a2e] dark:to-[#1c1f24] text-[#1f2937] dark:text-[#e5e2dc] border-[#d6ccbe] dark:border-[#3e3d3b] shadow-md dark:shadow-lg'
                                    }`}
                            >
                                {msg.role === 'assistant' ? <MarkdownRenderer content={msg.content} /> : msg.content}
                            </div>
                            {canCopy ? (
                                <div className={`mt-2 flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <button
                                        type="button"
                                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${copiedMessageIndex === index
                                            ? 'border bg-[#ecf7ef] dark:bg-[#1c2e24] text-[#2b6a43] dark:text-[#9dd5b0] border-[#94bb9f] dark:border-[#4a745a]'
                                            : 'border bg-[#fffbf6] dark:bg-[#1e2024] text-[#585a62] dark:text-[#b7b5b1] border-[#ddd6cc] dark:border-[#3e3d3b] shadow-md hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-xl'
                                            }`}
                                        onClick={() => onCopyMessage(msg, index)}
                                        aria-label={copiedMessageIndex === index ? 'Copied message' : 'Copy message'}
                                        title={copiedMessageIndex === index ? 'Copied' : 'Copy'}
                                    >
                                        {copiedMessageIndex === index ? <Check className="h-4 w-4" strokeWidth={2.1} /> : <Clipboard className="h-4 w-4" strokeWidth={1.9} />}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};