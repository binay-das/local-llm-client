"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, Bot, Pencil, RotateCw } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Message } from '@/types';

interface MessageListProps {
    messages: Message[];
    copiedMessageIndex: number | null;
    isGenerating: boolean;
    onCopyMessage: (message: Message, index: number) => void;
    onEditMessage: (message: Message, index: number, newContent: string) => void;
    onRegenerateMessage: (message: Message, index: number) => void;
    selectedModel?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    copiedMessageIndex,
    isGenerating,
    onCopyMessage,
    onEditMessage,
    onRegenerateMessage,
    selectedModel,
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editContent, setEditContent] = useState<string>('');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const modelShortName = selectedModel ? selectedModel.split(':')[0] : 'AI';

    const handleStartEdit = (msg: Message, index: number) => {
        setEditingIndex(index);
        setEditContent(msg.content);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditContent('');
    };

    const handleSaveEdit = (index: number) => {
        if (!editContent.trim() || isGenerating) return;
        const targetMsg = messages[index];
        const trimmed = editContent.trim();
        setEditingIndex(null);
        onEditMessage(targetMsg, index, trimmed);
    };

    if (messages.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center px-6 select-none py-12">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1f2327] border border-slate-200 dark:border-[#2e3238] flex items-center justify-center mb-6 shadow-md dark:shadow-lg">
                    <Bot size={28} className="text-indigo-600 dark:text-[#6366f1]" />
                </div>
                <h2 className="text-[2.1rem] font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-3">
                    How can I help you today?
                </h2>
                <p className="text-sm text-slate-500 dark:text-[#6b7280] max-w-md leading-relaxed">
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
                    const isEditingThis = editingIndex === index;

                    if (isEditingThis) {
                        return (
                            <div key={index} className="flex justify-end w-full">
                                <div className="w-full max-w-[85%] bg-white dark:bg-[#181a1d] border border-indigo-300 dark:border-[#6366f1]/50 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-lg">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSaveEdit(index);
                                            } else if (e.key === 'Escape') {
                                                handleCancelEdit();
                                            }
                                        }}
                                        className="w-full bg-slate-50 text-slate-900 dark:bg-[#111315] dark:text-[#e5e7eb] text-sm p-3 rounded-xl border border-slate-200 dark:border-[#2e3238] focus:outline-none focus:border-indigo-500 dark:focus:border-[#6366f1] resize-y min-h-20 leading-relaxed"
                                        placeholder="Edit prompt..."
                                        autoFocus
                                    />
                                    <div className="flex justify-end items-center gap-2 text-xs font-medium">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-3 py-1.5 rounded-lg text-slate-500 dark:text-[#9ca3af] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#272b30] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSaveEdit(index)}
                                            disabled={!editContent.trim() || isGenerating}
                                            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-[#6366f1] dark:hover:bg-[#4f46e5] text-white disabled:opacity-50 transition-colors shadow-xs font-semibold"
                                        >
                                            Save &amp; Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="group flex flex-col items-end gap-1.5">
                            <div className="max-w-[75%] bg-indigo-600 text-white dark:bg-[#1f2327] dark:border dark:border-[#2e3238] dark:text-[#e5e7eb] rounded-2xl rounded-tr-md px-4 py-3 text-sm leading-relaxed shadow-xs">
                                {msg.content}
                            </div>
                            {/* User action bar */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-2 px-1">
                                {!isGenerating && (
                                    <button
                                        onClick={() => handleStartEdit(msg, index)}
                                        title="Edit message"
                                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-[#6b7280] hover:text-indigo-600 dark:hover:text-[#a5b4fc] transition-colors"
                                    >
                                        <Pencil size={12} />
                                        <span>Edit</span>
                                    </button>
                                )}
                                {canCopy && (
                                    <button
                                        onClick={() => onCopyMessage(msg, index)}
                                        title="Copy message"
                                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-[#6b7280] hover:text-slate-600 dark:hover:text-[#9ca3af] transition-colors"
                                    >
                                        {copiedMessageIndex === index ? (
                                            <>
                                                <Check size={12} className="text-emerald-500 dark:text-[#10b981]" />
                                                <span className="text-emerald-500 dark:text-[#10b981]">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={12} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={index} className="group flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <Bot size={15} className="text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-400 dark:text-[#6b7280] mb-1.5 uppercase tracking-wide">
                                {modelShortName}
                            </p>

                            <div className="text-sm text-slate-800 dark:text-[#d1d5db] leading-relaxed">
                                {msg.content.trim() === '' && isStreamingAssistant ? (
                                    <div className="flex gap-1 items-center py-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-[#6366f1] animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-[#6366f1] animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-[#6366f1] animate-bounce [animation-delay:300ms]" />
                                    </div>
                                ) : (
                                    <MarkdownRenderer content={msg.content} />
                                )}
                            </div>

                            {canCopy && (
                                <div className="mt-2.5 flex items-center gap-3">
                                    <button
                                        onClick={() => onCopyMessage(msg, index)}
                                        title="Copy response"
                                        className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-[#6b7280] hover:text-slate-600 dark:hover:text-[#9ca3af] transition-colors"
                                    >
                                        {copiedMessageIndex === index ? (
                                            <>
                                                <Check size={12} className="text-emerald-500 dark:text-[#10b981]" />
                                                <span className="text-emerald-500 dark:text-[#10b981]">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={12} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>

                                    {!isGenerating && (
                                        <button
                                            onClick={() => onRegenerateMessage(msg, index)}
                                            title="Regenerate response"
                                            className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-[#6b7280] hover:text-indigo-600 dark:hover:text-[#6366f1] transition-colors group/regen"
                                        >
                                            <RotateCw size={12} className="group-hover/regen:rotate-180 transition-transform duration-300" />
                                            <span>Regenerate</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};