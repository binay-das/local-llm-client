import { NextResponse } from "next/server";
import { ChatService } from "@/lib/chatService";
import { OllamaService } from "@/lib/ollama";

export async function POST(req: Request) {
    try {
        const { chatId, model, messages, prompt } = await req.json();

        if (!chatId || !model || !messages || !prompt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await ChatService.addMessage(chatId, "user", prompt);

        const finalMessages = [...messages, { role: "user", content: prompt }];

        const stream = new ReadableStream({
            async start(controller) {
                let fullContent = "";
                try {
                    const asyncIterable = OllamaService.chatStream(model, finalMessages);
                    for await (const chunk of asyncIterable) {
                        fullContent += chunk;
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }

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
