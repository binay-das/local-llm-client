import React, { useState } from 'react';
import type { Message } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ModelSelector } from './ModelSelector';

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
                            updated[updated.length - 1].content += parsed.message.content;
                            return updated;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching from local LLM:', error);
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = 'Error: Failed to connect or generate response.';
                return updated;
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 text-gray-900">
            <div className="hidden md:flex flex-col w-64 bg-gray-900 text-white p-4 shrink-0">
                <h2 className="text-xl font-bold mb-6">Local LLM</h2>
                <div className="flex-1 overflow-y-auto">
                    <ModelSelector
                        selectedModel={selectedModel}
                        onSelectModel={setSelectedModel}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col h-full bg-white relative min-w-0">
                <div className="flex-1 overflow-y-auto p-4">
                    <MessageList messages={messages} />
                </div>

                <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        disabled={isGenerating || !selectedModel}
                    />
                </div>
            </div>
        </div>
    );
};
