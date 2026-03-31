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
            <div className="message-empty h-full">
                <div className="message-empty-panel mx-auto flex max-w-2xl flex-col items-start justify-center rounded-[2rem] p-8 md:p-10">
                    <span className="message-empty-kicker text-xs uppercase tracking-[0.28em]">Ready</span>
                    <h2 className="message-empty-title mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                        Start a conversation that stays on your machine.
                    </h2>
                    <p className="message-empty-copy mt-4 max-w-xl text-sm leading-7 md:text-base">
                        Choose a model from the left, ask a question, and this workspace will stream the response into a cleaner chat view.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                >
                    <div
                        className={`message-bubble max-w-[85%] px-5 py-3.5 ${msg.role === 'user'
                                ? 'message-bubble-user rounded-[1.6rem] rounded-br-md text-white'
                                : 'assistant-bubble rounded-[1.6rem] rounded-bl-md border'
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
