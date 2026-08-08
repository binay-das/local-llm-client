import { prisma } from "./prisma";
import { Role } from "@prisma/client";


export class ChatService {
    static async createChat(title: string, modelId?: string, modelName?: string) {
        return prisma.chat.create({
            data: {
                title: title?.trim() || "New Chat",
                modelId,
                modelName,
            },
        });
    }

    static async getChats() {
        return prisma.chat.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                _count: {
                    select: { messages: true },
                },
            },
        });
    }

    static async getChatById(id: string) {
        return prisma.chat.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });
    }

    static async getMessagesByChatId(chatId: string) {
        return prisma.message.findMany({
            where: {
                chatId
            },
            orderBy: {
                createdAt: "asc"
            }
        });
    }

    static async addMessage(chatId: string, role: string, content: string) {
        if (!content?.trim()) {
            throw new Error("Message content cannot be empty");
        }

        let prismaRole: Role = Role.USER;
        if (role === "assistant") prismaRole = Role.ASSISTANT;
        if (role === "system") prismaRole = Role.SYSTEM;

        const message = await prisma.message.create({
            data: {
                chatId,
                role: prismaRole,
                content: content.trim(),
            },
        });

        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });

        return message;
    }

    static async deleteChat(id: string) {
        return prisma.chat.delete({
            where: { id },
        });
    }
}
