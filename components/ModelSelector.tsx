"use client";
import { Model } from '@/types';
import React, { useEffect, useState } from 'react';

interface ModelSelectorProps {
    selectedModel: string;
    onSelectModel: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch('/api/models');
                if (!response.ok) throw new Error('Network error');
                const data = await response.json();
                const modelArray = Array.isArray(data) ? data : [];
                setModels(modelArray);

                if (modelArray.length > 0) {
                    const modelExists = modelArray.some((m: Model) => m.name === selectedModel);
                    if (!selectedModel || (!modelExists && selectedModel !== '')) {
                        onSelectModel(modelArray[0].name);
                    }
                }
            } catch (err) {
                setError('Failed to fetch models. Is Ollama running?');
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [selectedModel, onSelectModel]);

    if (loading) {
        return <div className="text-sm text-slate-500 dark:text-[#88888c]">Loading models...</div>;
    }
    if (error) {
        return <div className="text-sm text-red-500 dark:text-red-400">{error}</div>;
    }

    return (
        <div className="flex flex-col gap-2 rounded-2xl p-4 bg-white dark:bg-[#16191e]/70 border border-slate-200 dark:border-[#3c3f44] shadow-xs dark:shadow-lg">
            <label className="text-sm font-medium text-slate-700 dark:text-[#c0b29d]">Select Model:</label>
            <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-[#1b1e24] text-slate-900 dark:text-[#eee8e0] border border-slate-200 dark:border-[#404247] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
                <option value="" disabled>Choose a model</option>
                {models.map((model) => (
                    <option key={model.name} value={model.name}>
                        {model.name}
                    </option>
                ))}
            </select>
        </div>
    );
};