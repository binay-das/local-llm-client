import { NextResponse } from "next/server";
import { ChatService } from "@/lib/chatService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        if (!id) return NextResponse.json({ 
            error: "No ID provided" 
        }, { 
            status: 400 
        });

        const chat = await ChatService.getChatById(id);

        if (!chat) return NextResponse.json({ 
            error: "Chat not found" 
        }, { 
            status: 404 
        });

        return NextResponse.json(chat);
    } catch (error: any) {
        return NextResponse.json({ 
            error: error.message 
        }, { 
            status: 500 
        });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        await ChatService.deleteChat(id);

        return NextResponse.json({ 
            success: true 
        });

    } catch (error: any) {
        return NextResponse.json({ 
            error: error.message 
        }, { 
            status: 500 
        });
        
    }
}
