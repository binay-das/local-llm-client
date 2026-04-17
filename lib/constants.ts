export const SYSTEM_PROMPT = `
You are a helpful, brilliant, and expert AI assistant.
Answer the user's questions clearly and accurately.
If you don't know the answer, say that you don't know.
If context is provided, use it to answer the question.
`;

export const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
