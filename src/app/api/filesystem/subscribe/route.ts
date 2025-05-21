import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "filesystem");

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // 写入 SSE 头（Next.js 13+ 只需返回 Response，头部自动处理）

  // 监听目录变化
  const watcher = fs.watch(ROOT, { persistent: false }, () => {
    writer.write(new TextEncoder().encode("event: change\ndata: update\n\n"));
  });

  // 保持连接
  const keepAlive = setInterval(() => {
    writer.write(new TextEncoder().encode(": keep-alive\n\n"));
  }, 15000);

  // 用 AbortSignal 做清理
  req.signal?.addEventListener("abort", () => {
    watcher.close();
    clearInterval(keepAlive);
    writer.close();
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
} 