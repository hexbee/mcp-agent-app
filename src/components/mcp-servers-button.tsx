"use client";

import { useState } from "react";
import { MCPEndpointConfig } from "@copilotkit/runtime";
import { ExtendedMCPEndpointConfig } from "@/types/mcp";
import { MCPServerModal } from "./mcp-server-modal";

interface MCPServersButtonProps {
  mcpServers?: (MCPEndpointConfig | ExtendedMCPEndpointConfig)[];
  onAddServer?: (server: MCPEndpointConfig | ExtendedMCPEndpointConfig) => void;
  onRemoveServer?: (url: string) => void;
}

export function MCPServersButton({
  mcpServers = [],
  onAddServer = () => { },
  onRemoveServer = () => { },
}: MCPServersButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md shadow-md transition-colors"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="7"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="4"
            y="13"
            width="16"
            height="7"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="17" cy="7.5" r="1" fill="currentColor" />
          <circle cx="17" cy="16.5" r="1" fill="currentColor" />
        </svg>
        <span>MCP Servers</span>
      </button>
      <MCPServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mcpServers={mcpServers}
        onAddServer={onAddServer}
        onRemoveServer={onRemoveServer}
      />
    </>
  );
}
