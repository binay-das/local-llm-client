import { NextResponse } from "next/server";
import { ChatService } from "@/lib/chatService";

export async function GET() {
    try {
        const chats = await ChatService.getChats();
        return NextResponse.json(chats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { title, modelId, modelName } = await req.json();
        const chat = await ChatService.createChat(title, modelId, modelName);
        return NextResponse.json(chat);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
