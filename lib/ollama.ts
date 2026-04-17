import { OLLAMA_BASE_URL } from "./constants";
import { Message, Model } from "@/types";

export class OllamaService {
    static async getModels(): Promise<Model[]> {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
            if (!response.ok) {
                throw new Error("Failed to fetch models");
            }
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error("Error fetching models:", error);
            return [];
        }
    }

    static async getEmbeddings(modelName: string, prompt: string): Promise<number[]> {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: modelName, prompt }),
        });
        
        if (!response.ok) {
            throw new Error(`Failed to generate embeddings: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.embedding;
    }

    static async *chatStream(modelName: string, messages: Message[]) {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: modelName,
                messages: messages.map((m) => ({ role: m.role, content: m.content })),
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama chat error: ${response.status}`);
        }

        if (!response.body) {
            throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.message?.content) {
                        yield parsed.message.content;
                    }
                } catch (e) {
                    console.error("Error parsing Ollama chunk:", e, line);
                }
            }
        }

    }
}
