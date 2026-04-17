"use client";

import { Chat, Model } from '@/types';
import React, { useEffect, useState } from 'react';
import { Clock, Plus, Settings, HelpCircle, Trash2, Bot } from 'lucide-react';

interface SidebarProps {
    selectedModel: string;
    onSelectModel: (model: string) => void;
    activeChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    selectedModel,
    onSelectModel,
    activeChatId,
    onSelectChat,
    onNewChat
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
                if (!res.ok) return;
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
            else fetchChats();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="hidden md:flex flex-col w-[210px] shrink-0 bg-[#111315] border-r border-[#2a2d31] text-white h-full">
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shrink-0">
                        <Bot size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight text-white">Local LLM</p>
                        <p className="text-[10px] text-[#6b7280] leading-tight">Local Intelligence</p>
                    </div>
                </div>
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
                                    className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-all duration-150 ${
                                        isActive
                                            ? 'text-white border-b-2 border-white bg-transparent'
                                            : 'text-[#6b7280] hover:text-[#9ca3af] border-b-2 border-transparent'
                                    }`}
                                >
                                    {shortName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="px-3 mb-5">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1f2327] hover:bg-[#272b30] border border-[#2e3238] text-sm text-[#d1d5db] transition-all duration-150 font-medium"
                >
                    <Plus size={15} strokeWidth={2.5} />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 min-h-0">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#4b5563] font-semibold mb-2 px-1">Recent</p>
                <div className="space-y-0.5">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-all duration-100 ${
                                activeChatId === chat.id
                                    ? 'bg-[#1f2327] text-white'
                                    : 'text-[#9ca3af] hover:bg-[#1a1d21] hover:text-[#d1d5db]'
                            }`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Clock size={13} className="shrink-0 text-[#4b5563]" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs truncate leading-tight">{chat.title}</span>
                                    {(chat.modelName || chat.modelId) && (
                                        <span className="text-[9px] text-[#4b5563] truncate">{chat.modelName || chat.modelId}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#ef4444] hover:bg-[#3a1a1a] transition-all shrink-0"
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-3 py-4 border-t border-[#1e2226] space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[#6b7280] hover:text-[#d1d5db] hover:bg-[#1a1d21] transition-all text-xs">
                    <Settings size={14} />
                    Settings
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[#6b7280] hover:text-[#d1d5db] hover:bg-[#1a1d21] transition-all text-xs">
                    <HelpCircle size={14} />
                    Help
                </button>
            </div>
        </div>
    );
};
