import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export class ChatService {
    static async createChat(title: string, modelId?: string, modelName?: string) {
        return prisma.chat.create({
            data: {
                title,
                modelId,
                modelName,
            },
        });
    }

    static async getChats() {
        return prisma.chat.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    select: {
                        id: true,
                    }
                }
            }
        });
    }

    static async getChatById(id: string) {
        return prisma.chat.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        context: true,
                    }
                },
            },
        });
    }

    static async addMessage(chatId: string, role: string, content: string) {
        let prismaRole = Role.USER;
        if (role === "assistant") prismaRole = Role.ASSISTANT;
        if (role === "system") prismaRole = Role.SYSTEM;

        const message = await prisma.message.create({
            data: {
                chatId,
                role: prismaRole,
                content,
            },
        });

        // Update chat's updatedAt timestamp
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
