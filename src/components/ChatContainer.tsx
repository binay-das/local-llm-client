import React from 'react';

export const ChatContainer: React.FC = () => {
    return (
        <div className="flex h-screen w-full bg-gray-50 text-gray-900">
            <div className="hidden md:flex flex-col w-64 bg-gray-900 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Local LLM</h2>
                <div className="flex-1 overflow-y-auto">
                    {/* models or history */}
                </div>
            </div>

            <div className="flex-1 flex flex-col h-full bg-white relative">
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-center text-gray-400 mt-10">
                        Messages...
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="border border-gray-300 rounded p-2 text-gray-500">
                        Input box...
                    </div>
                </div>
            </div>
        </div>
    );
};
