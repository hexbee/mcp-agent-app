"use client";

import { useState, useEffect } from "react";
import { MCPEndpointConfig } from "@copilotkit/runtime";
import { cn } from "@/lib/utils";
import { ExtendedMCPEndpointConfig } from "@/types/mcp";

interface MCPServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcpServers: (MCPEndpointConfig | ExtendedMCPEndpointConfig)[];
  onAddServer: (server: MCPEndpointConfig | ExtendedMCPEndpointConfig) => void;
  onRemoveServer: (url: string) => void;
}

export function MCPServerModal({
  isOpen,
  onClose,
  mcpServers,
  onAddServer,
  onRemoveServer
}: MCPServerModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerUrl, setNewServerUrl] = useState("");
  const [connectionType, setConnectionType] = useState<"standard" | "sse">("standard");
  const [command, setCommand] = useState("");
  const [arguments_, setArguments] = useState("");

  // 确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<{ url: string, name?: string } | null>(null);

  // Stats
  const totalServers = mcpServers.length;
  const stdioServers = mcpServers.filter(server =>
    (server as ExtendedMCPEndpointConfig).type === "stdio"
  ).length;
  const sseServers = mcpServers.filter(server =>
    (server as ExtendedMCPEndpointConfig).type === "sse"
  ).length;

  // Handle adding a new server
  const addServer = () => {
    // 创建基本服务器配置，endpoint 先设为空字符串，后续再赋值
    const newServer: ExtendedMCPEndpointConfig = {
      endpoint: "",
      name: newServerName || undefined,
      type: connectionType === "standard" ? "stdio" : "sse"
    };

    // 根据连接类型设置不同的字段
    if (connectionType === "standard") {
      // 对于 Standard IO 类型，需要 command
      if (!command) {
        alert("Command is required for Standard IO connection type");
        return;
      }

      // 设置 command 和可选的 arguments
      newServer.command = command;
      if (arguments_) {
        newServer.arguments = arguments_;
      }

      // endpoint 仅用于唯一标识，不带 'stdio://'
      newServer.endpoint = [command, arguments_].filter(Boolean).join(" ");
    } else {
      // 对于 SSE 类型，需要 URL
      if (!newServerUrl) {
        alert("URL is required for SSE connection type");
        return;
      }

      // 设置 endpoint
      newServer.endpoint = newServerUrl;
    }

    // 转换为 MCPEndpointConfig 类型并添加
    onAddServer(newServer as MCPEndpointConfig);
    resetForm();
  };

  // Handle removing a server
  const handleRemoveServer = (url: string, serverName?: string) => {
    // 设置要删除的服务器信息并显示确认对话框
    setServerToDelete({ url, name: serverName });
    setShowDeleteConfirm(true);
  };

  // 确认删除服务器
  const confirmDelete = () => {
    if (serverToDelete) {
      onRemoveServer(serverToDelete.url);
      setShowDeleteConfirm(false);
      setServerToDelete(null);
    }
  };

  // 取消删除服务器
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setServerToDelete(null);
  };

  // Reset the form
  const resetForm = () => {
    setNewServerName("");
    setNewServerUrl("");
    setConnectionType("standard");
    setCommand("");
    setArguments("");
    setShowAddForm(false);
  };

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* 删除确认对话框 */}
      {showDeleteConfirm && serverToDelete && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the server "{serverToDelete.name || serverToDelete.url}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-700 dark:text-gray-300"
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
            <span className="text-xl font-semibold">MCP Server Configuration</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Manage and configure your MCP servers
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Servers</div>
              <div className="text-3xl font-bold">{totalServers}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Stdio Servers</div>
              <div className="text-3xl font-bold">{stdioServers}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">SSE Servers</div>
              <div className="text-3xl font-bold">{sseServers}</div>
            </div>
          </div>

          {/* Server List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Server List</h3>
            <div className="space-y-3">
              {mcpServers.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No servers configured yet
                </div>
              ) : (
                mcpServers.map((server, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg relative group border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <div className="font-medium">
                      {('name' in server && server.name) ? server.name : "Unnamed Server"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span className={cn(
                        "inline-block w-2 h-2 rounded-full",
                        (server as ExtendedMCPEndpointConfig).type === "stdio" ? "bg-green-500" : "bg-blue-500"
                      )}></span>
                      {(server as ExtendedMCPEndpointConfig).type}
                    </div>

                    {/* 根据服务器类型显示不同的信息 */}
                    {(server as ExtendedMCPEndpointConfig).type === "stdio" ? (
                      // 对于 Standard IO 类型，显示 Command 和 Arguments
                      <>
                        {(server as ExtendedMCPEndpointConfig).command && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 truncate pr-8">
                            Command: {(server as ExtendedMCPEndpointConfig).command}
                          </div>
                        )}
                        {(server as ExtendedMCPEndpointConfig).arguments && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 truncate pr-8">
                            Arguments: {(server as ExtendedMCPEndpointConfig).arguments}
                          </div>
                        )}
                      </>
                    ) : (
                      // 对于 SSE 类型，显示 URL
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate pr-8">
                        URL: {server.endpoint}
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveServer(server.endpoint, ('name' in server ? server.name : undefined))}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center"
                      title="删除服务器"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Server Button/Form */}
          {!showAddForm ? (
            <div className="flex justify-end items-center gap-2">
              {/* 快速添加 server 按钮 */}
              <button
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded text-xs font-semibold"
                title="添加 time server"
                onClick={() => onAddServer && onAddServer({
                  endpoint: 'uvx mcp-server-time --local-timezone=Asia/shanghai',
                  name: 'time',
                  type: 'stdio',
                  command: 'uvx',
                  arguments: 'mcp-server-time --local-timezone=Asia/shanghai',
                })}
              >time</button>
              <button
                className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-semibold"
                title="添加 filesystem server"
                onClick={() => onAddServer && onAddServer({
                  endpoint: 'npx -y @modelcontextprotocol/server-filesystem C:\\Users\\jiamingfeng\\Desktop\\copilotkit_work\\mcp-agent-app\\filesystem',
                  name: 'filesystem',
                  type: 'stdio',
                  command: 'npx',
                  arguments: '-y @modelcontextprotocol/server-filesystem C:\\Users\\jiamingfeng\\Desktop\\copilotkit_work\\mcp-agent-app\\filesystem',
                })}
              >filesystem</button>
              <button
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs font-semibold"
                title="添加 sequential-thinking server"
                onClick={() => onAddServer && onAddServer({
                  endpoint: 'npx -y @modelcontextprotocol/server-sequential-thinking',
                  name: 'sequential-thinking',
                  type: 'stdio',
                  command: 'npx',
                  arguments: '-y @modelcontextprotocol/server-sequential-thinking',
                })}
              >sequential-thinking</button>
              {/* 原有 Add Server 按钮 */}
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span>+</span> Add Server
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex justify-between">
                <span>+ Add New Server</span>
                <button onClick={resetForm} className="text-gray-500">✕</button>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Server Name</label>
                  <input
                    type="text"
                    placeholder="e.g., my-service, data-processor"
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Connection Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className={cn(
                        "p-2 border rounded-lg flex items-center justify-center gap-2",
                        connectionType === "standard"
                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                      onClick={() => setConnectionType("standard")}
                    >
                      <span>🖥️</span> Standard IO
                    </button>
                    <button
                      className={cn(
                        "p-2 border rounded-lg flex items-center justify-center gap-2",
                        connectionType === "sse"
                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                      onClick={() => setConnectionType("sse")}
                    >
                      <span>🌐</span> SSE
                    </button>
                  </div>
                </div>
                {/* URL 字段 - 仅在 SSE 模式下显示 */}
                {connectionType === "sse" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="text"
                      placeholder="e.g., http://localhost:8000/events"
                      value={newServerUrl}
                      onChange={(e) => setNewServerUrl(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                )}

                {/* Command 字段 - 仅在 Standard IO 模式下显示 */}
                {connectionType === "standard" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Command</label>
                    <input
                      type="text"
                      placeholder="e.g., python, node"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                )}

                {/* Arguments 字段 - 仅在 Standard IO 模式下显示 */}
                {connectionType === "standard" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Arguments</label>
                    <input
                      type="text"
                      placeholder="e.g., path/to/script.py"
                      value={arguments_}
                      onChange={(e) => setArguments(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    ✕ Cancel
                  </button>
                  <button
                    onClick={addServer}
                    disabled={connectionType === "standard" ? !command : !newServerUrl}
                    className={cn(
                      "px-4 py-2 rounded-lg text-white",
                      (connectionType === "standard" ? command : newServerUrl)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-400 cursor-not-allowed"
                    )}
                  >
                    + Add Server
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            More MCP servers available on the web, e.g.{" "}
            <a href="https://mcp.composio.dev" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              mcp.composio.dev
            </a>{" "}
            and{" "}
            <a href="https://mcp.run" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              mcp.run
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
