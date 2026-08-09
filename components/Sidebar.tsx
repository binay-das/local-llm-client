"use client";

import { Chat } from '@/types';
import React, { useEffect, useState } from 'react';
import { SquarePen, Settings, Trash2, X, PanelLeftClose } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
    activeChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    isOpen?: boolean;
    onClose?: () => void;
    onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeChatId,
    onSelectChat,
    onNewChat,
    isOpen = true,
    onClose,
    onToggleSidebar
}) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const fetchChats = async () => {
        try {
            const res = await fetch('/api/chats');
            if (res.ok) setChats(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchChats();
    }, [activeChatId]);

    const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await fetch(`/api/chats/${id}`, { method: 'DELETE' });
            if (activeChatId === id) onNewChat();
            await fetchChats();
        } catch (e) { console.error(e); }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full w-full bg-[#f9f9fb] dark:bg-[#121417] border-r border-slate-200/80 dark:border-[#22252a] text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="p-3.5 flex items-center justify-end">
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#1e2126] transition-colors"
                        title="Toggle sidebar"
                    >
                        <PanelLeftClose size={17} />
                    </button>
                )}
            </div>

            <div className="px-3 py-1">
                <button
                    onClick={() => {
                        onNewChat();
                        if (onClose) onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-200/60 dark:bg-[#1c1f24] hover:bg-slate-200 dark:hover:bg-[#25282e] border border-slate-300/40 dark:border-[#2a2d34] text-xs text-slate-700 dark:text-slate-200 font-medium transition-all duration-150 shadow-2xs"
                >
                    <SquarePen size={15} className="text-slate-600 dark:text-slate-300" />
                    <span>New Chat</span>
                </button>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 space-y-1">
                {chats.length > 0 && (
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-[#5d6470] font-semibold px-2 mb-1.5">
                        History
                    </p>
                )}
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => {
                            onSelectChat(chat.id);
                            if (onClose) onClose();
                        }}
                        className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-100 ${activeChatId === chat.id
                            ? 'bg-slate-200/80 dark:bg-[#1f2227] text-slate-900 dark:text-white font-medium'
                            : 'text-slate-600 dark:text-[#9ca3af] hover:bg-slate-200/40 dark:hover:bg-[#181a1e] hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <span className="text-xs truncate leading-tight flex-1">{chat.title}</span>
                        <button
                            onClick={(e) => handleDeleteChat(e, chat.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#3a1a1a] transition-all shrink-0"
                            aria-label="Delete chat"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Bottom Footer with Settings button */}
            <div className="p-3 border-t border-slate-200/80 dark:border-[#1e2125]">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-[#8f96a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#1c1f24] transition-all text-xs font-medium"
                >
                    <Settings size={15} />
                    <span>Settings</span>
                </button>
            </div>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={`hidden md:flex flex-col w-60 shrink-0 h-full transition-all duration-200 ${isOpen ? '' : '-ml-60'}`}>
                {sidebarContent}
            </div>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
                        onClick={onClose}
                    />
                    <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};
