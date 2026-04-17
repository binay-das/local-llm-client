import React, { useEffect, useState } from 'react';
import { ModelSelector } from './ModelSelector';
import { Chat } from '@/types';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

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

    const fetchChats = async () => {
        try {
            const res = await fetch('/api/chats');
            if (res.ok) {
                const data = await res.json();
                setChats(data);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [activeChatId]);

    const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await fetch(`/api/chats/${id}`, { method: 'DELETE' });
            if (activeChatId === id) {
                onNewChat();
            } else {
                fetchChats();
            }
        } catch (error) {
            console.error('Failed to delete chat', error);
        }
    };

    return (
        <div className="hidden md:flex flex-col w-72 p-5 shrink-0 bg-linear-to-b from-[#faf8f3] to-[#f0ece3] dark:from-[#191d23] dark:to-[#0f1115] border-r border-[#ded8cb] dark:border-[#303338] text-[#212731] dark:text-[#dcd8d4]">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#171d25] dark:text-[#f4efe8]">Ollama Client</h2>
                </div>
                <button 
                    onClick={onNewChat}
                    className="p-2 rounded-lg bg-linear-to-br from-white to-[#e8e3db] dark:from-[#2a2e36] dark:to-[#1f2228] border border-[#d6cfc2] dark:border-[#40444b] hover:shadow-md transition-all text-[#4a5568] dark:text-[#a0aec0]"
                    title="New Chat"
                >
                    <Plus size={18} />
                </button>
            </div>
            
            <div className="mb-6">
                <ModelSelector
                    selectedModel={selectedModel}
                    onSelectModel={onSelectModel}
                />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <h3 className="text-xs uppercase tracking-wider text-[#7e8590] dark:text-[#6b7280] mb-3 font-semibold">Chat History</h3>
                {chats.map(chat => (
                    <div 
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-[#e2e8f0] dark:bg-[#2d3748] border border-[#cbd5e1] dark:border-[#4a5568]' : 'hover:bg-[#f1f5f9] dark:hover:bg-[#1a202c] border border-transparent'}`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MessageSquare size={16} className={activeChatId === chat.id ? 'text-[#3b82f6]' : 'text-[#64748b]'} />
                            <div className="flex flex-col truncate">
                                <span className={`text-sm truncate ${activeChatId === chat.id ? 'font-medium text-[#0f172a] dark:text-[#f8fafc]' : 'text-[#334155] dark:text-[#cbd5e1]'} `}>
                                    {chat.title}
                                </span>
                                {(chat.modelName || chat.modelId) && (
                                    <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8] truncate">
                                        {chat.modelName || chat.modelId}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={(e) => handleDeleteChat(e, chat.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-[#ef4444] hover:bg-[#fee2e2] dark:hover:bg-[#7f1d1d] rounded-md transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
