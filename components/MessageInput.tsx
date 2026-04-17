"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, ArrowRight } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled, placeholder }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }, [input]);

    return (
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 rounded-2xl bg-[#1a1d21] border border-[#2e3238] px-3 py-2.5 shadow-xl">
            {/* Attachment */}
            <button
                type="button"
                className="shrink-0 p-1.5 text-[#4b5563] hover:text-[#9ca3af] transition-colors rounded-lg"
                aria-label="Attach file"
            >
                <Paperclip size={18} strokeWidth={1.8} />
            </button>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={placeholder || 'Message...'}
                rows={1}
                className="flex-1 resize-none bg-transparent text-[#e5e7eb] placeholder:text-[#4b5563] text-sm leading-relaxed focus:outline-none disabled:opacity-40 min-h-[28px] max-h-[160px] py-1"
            />

            {/* Mic */}
            <button
                type="button"
                className="shrink-0 p-1.5 text-[#4b5563] hover:text-[#9ca3af] transition-colors rounded-lg"
                aria-label="Voice input"
            >
                <Mic size={18} strokeWidth={1.8} />
            </button>

            {/* Send */}
            <button
                type="submit"
                disabled={disabled || !input.trim()}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#6366f1] hover:bg-[#4f52d4] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                aria-label="Send message"
            >
                <ArrowRight size={15} strokeWidth={2.5} className="text-white" />
            </button>
        </form>
    );
};