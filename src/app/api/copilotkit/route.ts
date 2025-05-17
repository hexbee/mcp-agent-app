import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { MCPClient } from "@/app/utils/mcp-client";

import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY || "dummy-api-key"
});

const serviceAdapter = new OpenAIAdapter({
  openai,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini"
});

const runtime = new CopilotRuntime({
  createMCPClient: async (config) => {
    const mcpClient = new MCPClient({
      serverUrl: config.endpoint,
    });
    await mcpClient.connect();
    return mcpClient;
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
