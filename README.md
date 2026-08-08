# Local LLM Client

A minimal, privacy-focused web UI for chatting with local LLMs via Ollama. Built with Next.js, React, SQLite, and Prisma.

## Features

- Connects to local Ollama instance (`http://localhost:11434`)
- Real-time streaming responses
- Local chat history saved in SQLite
- Edit past prompts & regenerate answers
- Markdown & code block formatting

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Database**:
   ```bash
   npx prisma db push && npx prisma generate
   ```

3. **Run Ollama & start dev server**:
   ```bash
   ollama serve
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to start chatting.
