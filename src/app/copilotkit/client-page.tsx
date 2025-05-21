"use client";

import { useEffect, useState } from "react";
import path from "path";

import { useCopilotChat, useCopilotAction, CatchAllActionRenderProps } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { MCPEndpointConfig } from "@copilotkit/runtime";
import { ExtendedMCPEndpointConfig } from "@/types/mcp";
import { DefaultToolRender } from "@/components/default-tool-render";
import { MCPServersButton } from "@/components/mcp-servers-button";
// import { MCPServersProvider } from "@/components/mcp-servers-provider";

const themeColor = "#6366f1";

// Simple wrapper component for MCP Servers button
function MCPServersWrapper() {
  const { mcpServers, setMcpServers } = useCopilotChat();
  const [initialized, setInitialized] = useState(false);

  // 确保服务器列表被初始化
  useEffect(() => {
    if (!initialized && setMcpServers) {
      // 初始化为空数组，避免undefined
      setMcpServers([]);
      setInitialized(true);
    }
  }, [mcpServers, setMcpServers, initialized]);

  const addServer = (server: MCPEndpointConfig | ExtendedMCPEndpointConfig) => {
    if (mcpServers) {
      console.log("Adding server:", server);
      setMcpServers([...mcpServers, server]);
    } else {
      console.log("Initializing with server:", server);
      setMcpServers([server]);
    }
  };

  const removeServer = (url: string) => {
    if (mcpServers) {
      console.log("Removing server with URL:", url);
      console.log("Before removal:", mcpServers);
      const updatedServers = mcpServers.filter((server) => server.endpoint !== url);
      console.log("After removal:", updatedServers);
      setMcpServers(updatedServers);
    }
  };

  // 等待初始化完成
  if (!mcpServers) return null;

  return (
    <MCPServersButton
      mcpServers={mcpServers}
      onAddServer={addServer}
      onRemoveServer={removeServer}
    />
  );
}

export function ClientCopilotKitPage() {
  return (
    <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}>
      {/* 顶部导航栏 */}
      <div className="w-full flex items-center justify-between px-8 py-4 bg-white shadow z-10">
        <div className="text-2xl font-bold text-indigo-600">MCP Agent App</div>
        <div className="flex items-center gap-4">
          {/* MCP Servers 按钮占位，后续可加更多按钮 */}
          <MCPServersWrapper />
          {/* 预留更多按钮位置 */}
        </div>
      </div>
      {/* 主体内容 */}
      <YourMainContent />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "Popup Assistant",
          initial: "👋 Hi, there! You're chatting with an LLM that can use MCP servers.\n\n Since you scaffolded me with **CopilotKit**, you can ask me to use any MCP servers that you have set up on this page.\n\nIn your codebase, check out this page's code to see how it all works! 你可以随时扩展更多功能！\n\nNow, what can I do for you?"
        }}
      />
    </main>
  );
}

function YourMainContent() {
  // 文件系统相关状态
  const [fileTree, setFileTree] = useState<{ name: string; isDir: boolean }[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 获取文件树（只在有变更时刷新）
  useEffect(() => {
    const fetchTree = () => {
      fetch("/api/filesystem?op=list")
        .then(res => res.json())
        .then(data => setFileTree(data.files || []));
    };
    fetchTree();
    // 监听 SSE
    const es = new EventSource("/api/filesystem/subscribe");
    es.addEventListener("change", () => {
      fetchTree();
    });
    return () => es.close();
  }, []);

  // 读取文件内容
  const handleFileClick = (filename: string) => {
    setSelectedFile(filename);
    setLoading(true);
    fetch(`/api/filesystem?op=read&file=${encodeURIComponent(filename)}`)
      .then(res => res.json())
      .then(data => {
        setFileContent(data.content || "(空文件)");
        setLoading(false);
      });
  };

  // 获取全局状态，但只用于显示
  const { mcpServers } = useCopilotChat();

  // 🪁 Copilot Suggestions: https://docs.copilotkit.ai/guides/copilot-suggestions
  useCopilotChatSuggestions({
    maxSuggestions: 3,
    instructions: "Give the user a short and concise suggestion based on the conversation and your available tools. If you have no tools, don't suggest anything.",
  })

  // 🪁 Catch-all Action for rendering MCP tool calls: https://docs.copilotkit.ai/guides/generative-ui?gen-ui-type=Catch+all+renders
  useCopilotAction({
    name: "*",
    render: ({ name, status, args, result }: CatchAllActionRenderProps<[]>) => (
      <DefaultToolRender status={status} name={name} args={args} result={result} />
    ),
  });

  // Style variables
  const classes = {
    wrapper: "h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300",
    container: "bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full",
    server: "bg-white/15 p-4 rounded-xl text-white relative group hover:bg-white/20 transition-all",
    deleteButton: "absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center",
    input: "bg-white/20 p-4 rounded-xl text-white relative group hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500",
    submitButton: "w-full p-4 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all",
  }

  return (
    <div className="h-screen w-screen flex flex-row bg-gray-100">
      {/* 文件树区域 */}
      <div className="w-64 bg-white border-r h-full p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">文件系统 (filesystem)</h2>
        <ul>
          {fileTree.length === 0 && <li className="text-gray-400">(空目录)</li>}
          {fileTree.map((item) => (
            <li key={item.name} className="mb-2">
              {item.isDir ? (
                <span className="text-blue-600">📁 {item.name}</span>
              ) : (
                <button
                  className={`text-left w-full ${selectedFile === item.name ? "font-bold text-indigo-600" : "text-gray-800"}`}
                  onClick={() => handleFileClick(item.name)}
                >
                  📄 {item.name}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* 文件内容区 */}
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="font-bold mb-4">{selectedFile ? `文件内容：${selectedFile}` : "请选择左侧的文件"}</h2>
        {loading ? (
          <div className="text-gray-400">加载中...</div>
        ) : (
          <pre className="bg-gray-200 rounded p-4 whitespace-pre-wrap min-h-[200px]">{fileContent}</pre>
        )}
      </div>
    </div>
  );
}
