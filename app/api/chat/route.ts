import { NextResponse } from "next/server";
import { ChatService } from "@/lib/chatService";
import { OllamaService } from "@/lib/ollama";

export async function POST(req: Request) {
    try {
        const { chatId, model, prompt, action, messageId } = await req.json();

        if (!chatId || !model) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (action === "edit") {
            if (!messageId || !prompt) {
                return NextResponse.json({ error: "Missing messageId or prompt for edit" }, { status: 400 });
            }
            const targetMsg = await ChatService.getMessageById(messageId);
            if (!targetMsg || targetMsg.chatId !== chatId) {
                return NextResponse.json({ error: "Message not found" }, { status: 404 });
            }
            await ChatService.updateMessage(messageId, prompt);
            await ChatService.deleteMessagesAfter(chatId, targetMsg.createdAt);
        } else if (action === "regenerate") {
            let targetMsg = messageId ? await ChatService.getMessageById(messageId) : null;
            if (!targetMsg) {
                const messages = await ChatService.getMessagesByChatId(chatId);
                targetMsg = messages.filter((m) => m.role === "ASSISTANT").slice(-1)[0] || null;
            }
            if (targetMsg) {
                await ChatService.deleteMessagesAfter(chatId, targetMsg.createdAt);
                await ChatService.deleteMessage(targetMsg.id);
            }
        } else {
            if (!prompt) {
                return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
            }
            await ChatService.addMessage(chatId, "user", prompt);
        }

        const persistedMessages = await ChatService.getMessagesByChatId(chatId);

        if (persistedMessages.length === 0) {
            return NextResponse.json({ error: "No messages to generate response for" }, { status: 400 });
        }

        const ollamaMessages = persistedMessages.map((m) => ({
            role: m.role.toLowerCase() as "user" | "assistant" | "system",
            content: m.content,
        }));

        const stream = new ReadableStream({
            async start(controller) {
                let fullContent = "";
                try {
                    const asyncIterable = OllamaService.chatStream(model, ollamaMessages);
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
