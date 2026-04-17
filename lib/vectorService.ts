import { prisma } from "./prisma";

export class VectorService {
    static async saveContextEmbedding(messageId: string, content: string, embedding: number[]) {
        const embeddingString = `[${embedding.join(',')}]`;
        
        const existingContext = await prisma.context.findUnique({
            where: { messageId }
        });

        if (existingContext) {
            await prisma.$executeRaw`
                UPDATE "Context"
                SET "embedding" = ${embeddingString}::vector, "content" = ${content}
                WHERE "messageId" = ${messageId}
            `;
            return existingContext;
        } else {
            const context = await prisma.context.create({
                data: {
                    messageId,
                    content,
                }
            });

            await prisma.$executeRaw`
                UPDATE "Context" 
                SET "embedding" = ${embeddingString}::vector
                WHERE "id" = ${context.id}
            `;
            
            return context;
        }
    }
    
    static async findSimilarContext(embedding: number[], limit: number = 3) {
        const embeddingString = `[${embedding.join(',')}]`;

        const similarContexts = await prisma.$queryRaw`
            SELECT id, "messageId", content, 1 - (embedding <=> ${embeddingString}::vector) as similarity
            FROM "Context"
            ORDER BY embedding <=> ${embeddingString}::vector
            LIMIT ${limit}
        `;
        
        return similarContexts as Array<{id: string, messageId: string, content: string, similarity: number}>;
    }
}
