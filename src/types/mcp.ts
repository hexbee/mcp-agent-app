// 扩展 MCPEndpointConfig 类型，以包含 command、arguments 和 type 字段
export interface ExtendedMCPEndpointConfig {
  endpoint: string;
  name?: string;
  command?: string;
  arguments?: string;
  type?: "stdio" | "sse"; // 明确标记服务器类型
}
