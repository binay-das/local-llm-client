import React, { useEffect, useRef } from 'react';
import { Check, Clipboard } from 'lucide-react';
import type { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageListProps {
    messages: Message[];
    copiedMessageIndex: number | null;
    isGenerating: boolean;
    onCopyMessage: (message: Message, index: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, copiedMessageIndex, isGenerating, onCopyMessage }) => {
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
            {messages.map((msg, index) => {
                const isStreamingAssistant = isGenerating && msg.role === 'assistant' && index === messages.length - 1;
                const canCopy = msg.content.trim().length > 0 && !isStreamingAssistant;

                return (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div className={`message-bubble-wrap flex max-w-[85%] flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`message-bubble w-full px-5 py-3.5 ${msg.role === 'user'
                                    ? 'message-bubble-user rounded-[1.6rem] rounded-br-md text-white'
                                    : 'assistant-bubble rounded-[1.6rem] rounded-bl-md border'
                                    }`}
                            >
                                {msg.role === 'assistant' ? <MarkdownRenderer content={msg.content} /> : msg.content}
                            </div>
                            {canCopy ? (
                                <div className={`message-actions mt-2 flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <button
                                        type="button"
                                        className={`message-copy-button inline-flex h-8 w-8 items-center justify-center rounded-full ${copiedMessageIndex === index ? 'message-copy-button-copied' : ''}`}
                                        onClick={() => onCopyMessage(msg, index)}
                                        aria-label={copiedMessageIndex === index ? 'Copied message' : 'Copy message'}
                                        title={copiedMessageIndex === index ? 'Copied' : 'Copy'}
                                    >
                                        {copiedMessageIndex === index ? <Check className="h-4 w-4" strokeWidth={2.1} /> : <Clipboard className="h-4 w-4" strokeWidth={1.9} />}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};
