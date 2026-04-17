export interface Message {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt?: Date;
    context?: string;
}

export interface Chat {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    modelId?: string | null;
    modelName?: string | null;
    messages?: Message[];
}

export interface Model {
    name: string;
    size?: number;
    digest?: string;
    modifiedAt?: string;
}
