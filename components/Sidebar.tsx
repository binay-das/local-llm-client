"use client";

import { Chat, Model } from '@/types';
import React, { useEffect, useState } from 'react';
import { Clock, Plus, Settings, HelpCircle, Trash2, Bot, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
    selectedModel: string;
    onSelectModel: (model: string) => void;
    activeChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    selectedModel,
    onSelectModel,
    activeChatId,
    onSelectChat,
    onNewChat,
    isOpen = false,
    onClose
}) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [models, setModels] = useState<Model[]>([]);

    const fetchChats = async () => {
        try {
            const res = await fetch('/api/chats');
            if (res.ok) setChats(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchChats();
    }, [activeChatId]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await fetch('/api/models');
                if (!res.ok) {
                    return;
                }
                const data = await res.json();
                const arr: Model[] = Array.isArray(data) ? data : [];
                setModels(arr);
                if (arr.length > 0) {
                    const exists = arr.some(m => m.name === selectedModel);
                    if (!selectedModel || !exists) onSelectModel(arr[0].name);
                }

            } catch (e) {
                console.error(e);
            }
        };
        fetchModels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await fetch(`/api/chats/${id}`, { method: 'DELETE' });
            if (activeChatId === id) onNewChat();
            await fetchChats();
        } catch (e) { console.error(e); }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full w-full bg-slate-100 dark:bg-[#111315] border-r border-slate-200 dark:border-[#2a2d31] text-slate-800 dark:text-white transition-colors duration-200">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                        <Bot size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">Local LLM</p>
                        <p className="text-[10px] text-slate-500 dark:text-[#6b7280] leading-tight">Local Intelligence</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white md:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {models.length > 0 && (
                <div className="px-3 mb-4">
                    <div className="flex flex-wrap gap-1.5">
                        {models.slice(0, 4).map(m => {
                            const shortName = m.name.split(':')[0].toUpperCase();
                            const isActive = m.name === selectedModel;
                            return (
                                <button
                                    key={m.name}
                                    onClick={() => onSelectModel(m.name)}
                                    title={m.name}
                                    className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-all duration-150 ${isActive
                                        ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-600 dark:border-white bg-indigo-50 dark:bg-transparent'
                                        : 'text-slate-500 dark:text-[#6b7280] hover:text-slate-800 dark:hover:text-[#9ca3af] border-b-2 border-transparent'
                                        }`}
                                >
                                    {shortName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="px-3 mb-4">
                <button
                    onClick={() => {
                        onNewChat();
                        if (onClose) onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#1f2327] dark:hover:bg-[#272b30] border border-slate-200 dark:border-[#2e3238] text-sm text-slate-700 dark:text-[#d1d5db] transition-all duration-150 font-medium shadow-xs"
                >
                    <Plus size={15} strokeWidth={2.5} />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 min-h-0">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-[#4b5563] font-semibold mb-2 px-1">Recent</p>
                <div className="space-y-0.5">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => {
                                onSelectChat(chat.id);
                                if (onClose) onClose();
                            }}
                            className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-all duration-100 ${activeChatId === chat.id
                                ? 'bg-white dark:bg-[#1f2327] text-slate-900 dark:text-white font-medium shadow-xs'
                                : 'text-slate-600 dark:text-[#9ca3af] hover:bg-slate-200/60 dark:hover:bg-[#1a1d21] hover:text-slate-900 dark:hover:text-[#d1d5db]'
                                }`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Clock size={13} className="shrink-0 text-slate-400 dark:text-[#4b5563]" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs truncate leading-tight">{chat.title}</span>
                                    {(chat.modelName || chat.modelId) && (
                                        <span className="text-[9px] text-slate-400 dark:text-[#4b5563] truncate">{chat.modelName || chat.modelId}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-[#3a1a1a] transition-all shrink-0"
                                aria-label="Delete chat"
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-3 py-3 border-t border-slate-200 dark:border-[#1e2226] space-y-1">
                <div className="flex items-center justify-between px-1 py-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-[#6b7280]">Theme</span>
                    <ThemeToggle />
                </div>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-500 dark:text-[#6b7280] hover:text-slate-900 dark:hover:text-[#d1d5db] hover:bg-slate-200/50 dark:hover:bg-[#1a1d21] transition-all text-xs">
                    <Settings size={14} />
                    Settings
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-500 dark:text-[#6b7280] hover:text-slate-900 dark:hover:text-[#d1d5db] hover:bg-slate-200/50 dark:hover:bg-[#1a1d21] transition-all text-xs">
                    <HelpCircle size={14} />
                    Help
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-56 shrink-0 h-full">
                {sidebarContent}
            </div>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-xs transition-opacity"
                        onClick={onClose}
                    />
                    <div className="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};

