"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ChevronDown, Check } from 'lucide-react';
import { Model } from '@/types';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
    selectedModel: string;
    onSelectModel: (model: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    disabled,
    placeholder,
    selectedModel,
    onSelectModel,
}) => {
    const [input, setInput] = useState('');
    const [models, setModels] = useState<Model[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch models for dropdown
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await fetch('/api/models');
                if (res.ok) {
                    const data = await res.json();
                    const arr: Model[] = Array.isArray(data) ? data : [];
                    setModels(arr);
                    if (arr.length > 0 && !selectedModel) {
                        onSelectModel(arr[0].name);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch models', e);
            }
        };
        fetchModels();
    }, [selectedModel, onSelectModel]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input.trim() && !disabled) {
            onSendMessage(input.trim());
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    }, [input]);

    const modelDisplayName = selectedModel ? selectedModel : 'Select Model';

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex flex-col rounded-3xl bg-slate-200/50 dark:bg-[#16181c] border border-slate-200/90 dark:border-[#23262c] p-3.5 shadow-2xs transition-colors duration-200"
        >
            {/* Textarea Area */}
            <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={placeholder || 'Send a message'}
                rows={1}
                className="w-full resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-[#656d7b] text-sm leading-relaxed focus:outline-none disabled:opacity-40 min-h-9 max-h-45 px-1 pt-1"
            />

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-300/50 hover:bg-slate-300 dark:bg-[#22252b] dark:hover:bg-[#2b2f37] border border-slate-300/60 dark:border-[#2e323b] text-xs font-medium text-slate-700 dark:text-slate-200 transition-all duration-150"
                        >
                            <span className="truncate max-w-35">{modelDisplayName}</span>
                            <ChevronDown size={13} className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 bottom-full mb-2 z-50 w-56 bg-white dark:bg-[#1c1f24] border border-slate-200 dark:border-[#2e3238] rounded-2xl p-1.5 shadow-xl transition-all duration-150">
                                <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 px-2.5 py-1">
                                    Available Models
                                </div>
                                {models.length === 0 ? (
                                    <div className="px-2.5 py-2 text-xs text-slate-400">No models found</div>
                                ) : (
                                    models.map(m => (
                                        <button
                                            key={m.name}
                                            type="button"
                                            onClick={() => {
                                                onSelectModel(m.name);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${m.name === selectedModel
                                                    ? 'bg-slate-100 dark:bg-[#272b32] text-slate-900 dark:text-white font-medium'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#22252b]'
                                                }`}
                                        >
                                            <span className="truncate">{m.name}</span>
                                            {m.name === selectedModel && (
                                                <Check size={14} className="text-slate-800 dark:text-slate-200 shrink-0" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={disabled || !input.trim()}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-300 dark:bg-[#2c3038] hover:bg-slate-400 dark:hover:bg-[#3b404a] text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-2xs"
                        aria-label="Send message"
                    >
                        <ArrowUp size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </form>
    );
};