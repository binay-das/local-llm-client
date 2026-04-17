"use client";

import React, { useState } from 'react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 w-full rounded-[1.75rem] p-[0.65rem] bg-[#fffbf6]/60 dark:bg-[#12141a]/70 border border-[#e3dbcf] dark:border-[#35383c] shadow-lg dark:shadow-xl">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={disabled}
                placeholder="Ask your local model something useful..."
                className="flex-1 rounded-2xl px-5 py-3.5 bg-[#fffcf7] dark:bg-[#1e2024] text-[#1f2937] dark:text-[#ebe7df] border border-[#dfd7c8] dark:border-[#3d3e42] placeholder:text-[#86868a] dark:placeholder:text-[#878785] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-[#f2ece4] dark:disabled:bg-[#1d1f22]"
            />
            <button
                type="submit"
                disabled={disabled || !input.trim()}
                className="min-w-[6rem] px-5 py-3 rounded-2xl font-medium bg-gradient-to-br from-[#2a3441] to-[#43586f] dark:from-[#84694f] dark:to-[#5c4837] text-[#faf7f1] dark:text-[#fcf7f0] shadow-md dark:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
            >
                Send
            </button>
        </form>
    );
};