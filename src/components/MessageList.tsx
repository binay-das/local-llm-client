import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';

interface MessageListProps {
    messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="message-empty flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 h-full">
                Start a conversation...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                >
                    <div
                        className={`message-bubble max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'assistant-bubble bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
                            }`}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
};
