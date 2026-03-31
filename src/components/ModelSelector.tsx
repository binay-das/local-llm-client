import React, { useEffect, useState } from 'react';
import type { Model } from '../types';

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
                const response = await fetch('http://localhost:11434/api/tags');
                if (!response.ok) throw new Error('Network error');
                const data = await response.json();
                setModels(data.models || []);

                if (!selectedModel && data.models && data.models.length > 0) {
                    onSelectModel(data.models[0].name);
                }
            } catch (err) {
                setError('Failed to fetch models. Is Ollama running?');
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [selectedModel, onSelectModel]);

    if (loading) return <div className="app-model-hint text-sm">Loading models...</div>;
    if (error) return <div className="text-red-400 text-sm">{error}</div>;

    return (
        <div className="flex flex-col gap-2">
            <label className="app-model-label text-sm font-medium">Select Model:</label>
            <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="app-model-select w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
