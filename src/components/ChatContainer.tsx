import React, { useState } from 'react';
import type { Message } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ModelSelector } from './ModelSelector';
import { Header } from './Header';

export const ChatContainer: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('');

    const handleSendMessage = async (content: string) => {
        if (!selectedModel) {
            alert('Please select a model first');
            return;
        }

        const userMessage: Message = { role: 'user', content };
        const initialMessages = [...messages, userMessage];
        setMessages(initialMessages);
        setIsGenerating(true);


        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: initialMessages,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body stream available');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('\n').filter((line) => line.trim() !== '');

                for (const line of lines) {
                    const parsed = JSON.parse(line);
                    if (parsed.message?.content) {
                        setMessages((prev) => {
                            const updated = [...prev];
                            const lastIndex = updated.length - 1;
                            updated[lastIndex] = {
                                ...updated[lastIndex],
                                content: updated[lastIndex].content + parsed.message.content
                            };
                            return updated;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching from local LLM:', error);
            setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: 'Error: Failed to connect or generate response.'
                };
                return updated;
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="app-shell flex h-screen w-full">
            <div className="app-sidebar hidden md:flex flex-col w-[18.5rem] p-5 shrink-0">
                <div className="app-sidebar-top mb-8">
                    <p className="app-sidebar-eyebrow text-xs uppercase tracking-[0.24em]">Workspace</p>
                    <h2 className="app-sidebar-title mt-3 text-2xl font-semibold">Studio</h2>
                    <p className="app-sidebar-copy mt-2 text-sm leading-6">
                        Pick a local model and keep the conversation flowing in a calmer, sharper workspace.
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ModelSelector
                        selectedModel={selectedModel}
                        onSelectModel={setSelectedModel}
                    />
                </div>
            </div>

            <div className="app-main flex-1 flex flex-col h-full relative min-w-0">
                <Header />

                <div className="app-messages flex-1 overflow-y-auto px-4 py-5 md:px-6">
                    <MessageList messages={messages} />
                </div>

                <div className="app-input-wrap p-4 md:p-6 shrink-0">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={isGenerating || !selectedModel}
                    />
                </div>
            </div>
        </div>
    );
};
