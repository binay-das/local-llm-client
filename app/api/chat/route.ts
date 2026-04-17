import { NextResponse } from "next/server";
import { ChatService } from "@/lib/chatService";
import { VectorService } from "@/lib/vectorService";
import { OllamaService } from "@/lib/ollama";

export async function POST(req: Request) {
    try {
        const { chatId, model, messages, prompt } = await req.json();

        if (!chatId || !model || !messages || !prompt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userMsg = await ChatService.addMessage(chatId, "user", prompt);
        
        // generate and save embedding in background
        OllamaService.getEmbeddings(model, prompt).then((embedding) => {
           VectorService.saveContextEmbedding(userMsg.id, prompt, embedding).catch(console.error);
        }).catch(console.error);


        let contextText = "";
        try {
            const currentEmbedding = await OllamaService.getEmbeddings(model, prompt);
            const similarContexts = await VectorService.findSimilarContext(currentEmbedding);
            if (similarContexts.length > 0) {
                contextText = similarContexts.map((c) => c.content).join("\n---\n");
            }
        } catch (error) {
            console.error("Context fetch error:", error);
        }

        // build prompt with context if it exists
        const systemPrompt = "You are a helpful local LLM. Use the following context if it is useful to answer the latest question.\n\nContext:\n" + contextText;
        const finalMessages = [{ role: "system", content: systemPrompt }, ...messages, { role: "user", content: prompt }];

        const stream = new ReadableStream({
            async start(controller) {
                let fullContent = "";
                try {
                    const asyncIterable = OllamaService.chatStream(model, finalMessages);
                    for await (const chunk of asyncIterable) {
                        fullContent += chunk;
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }
                    
                    // Save Assistant Message when completely done
                    await ChatService.addMessage(chatId, "assistant", fullContent);

                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
