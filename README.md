# MCP-Enabled agent

This project demonstrates a Next.js application with an integrated AI agent powered by CopilotKit and Model Context Protocol (MCP).

## Features

- Modern Next.js 15 application with App Router
- AI agent sidebar with MCP capabilities
- Tailwind CSS for styling
- TypeScript support

## Getting Started

First, set up your environment variables:

```bash
# Create a .env file with your OpenAI API key
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1 # or your preferred OpenAI endpoint
OPENAI_MODEL=gpt-4o-mini # or your preferred model
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000/copilotkit](http://localhost:3000/copilotkit) with your browser to see the application.

## Project Structure

- `src/app/page.tsx`: Main application page
- `src/app/copilotkit/`: CopilotKit integration components
- `src/app/api/copilotkit/`: API route for CopilotKit backend
- `src/app/utils/mcp-client.ts`: MCP client implementation

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP Servers in composio.dev](https://mcp.composio.dev)
