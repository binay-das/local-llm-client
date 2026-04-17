import { NextResponse } from "next/server";
import { OllamaService } from "@/lib/ollama";

export async function GET() {
    try {
        const models = await OllamaService.getModels();
        return NextResponse.json(models);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
