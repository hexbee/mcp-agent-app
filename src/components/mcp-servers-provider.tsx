"use client";

import React, { ReactNode, useState } from "react";
import { MCPEndpointConfig } from "@copilotkit/runtime";
import { useCopilotChat } from "@copilotkit/react-core";

// Context to share MCP server data
export interface MCPServersContextProps {
  mcpServers: MCPEndpointConfig[];
  addServer: (server: MCPEndpointConfig) => void;
  removeServer: (url: string) => void;
}

interface MCPServersProviderProps {
  children: ReactNode;
}

export function MCPServersProvider({ children }: MCPServersProviderProps) {
  const { mcpServers, setMcpServers } = useCopilotChat();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with empty array if not already initialized
  if (!isInitialized && mcpServers) {
    setIsInitialized(true);
  }

  const addServer = (server: MCPEndpointConfig) => {
    if (mcpServers) {
      setMcpServers([...mcpServers, server]);
    } else {
      setMcpServers([server]);
    }
  };

  const removeServer = (url: string) => {
    if (mcpServers) {
      setMcpServers(mcpServers.filter((server) => server.endpoint !== url));
    }
  };

  // Only render children when mcpServers is available
  if (!mcpServers) {
    return null;
  }

  // Render children with props
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, index) => {
          // For TypeScript to recognize the child as a valid React element
          if (typeof child === 'object' && child !== null && 'type' in child) {
            // Pass props to the child component
            return (
              <child.type
                key={index}
                {...(child.props ?? {})}
                mcpServers={mcpServers}
                onAddServer={addServer}
                onRemoveServer={removeServer}
              />
            );
          }
          return child;
        })}
      </>
    );
  }

  // Handle single child case
  if (typeof children === 'object' && children !== null && 'type' in children) {
    const child = children as React.ReactElement;
    return (
      <child.type
        {...(child.props ?? {})}
        mcpServers={mcpServers}
        onAddServer={addServer}
        onRemoveServer={removeServer}
      />
    );
  }

  // Fallback
  return <>{children}</>;
}
