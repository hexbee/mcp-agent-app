import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "filesystem");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const op = searchParams.get("op");

  if (op === "list") {
    // 列出根目录下所有文件和文件夹
    try {
      const files = fs.readdirSync(ROOT).map((name) => {
        const stat = fs.statSync(path.join(ROOT, name));
        return { name, isDir: stat.isDirectory() };
      });
      return NextResponse.json({ files });
    } catch (e) {
      return NextResponse.json({ files: [], error: String(e) }, { status: 500 });
    }
  }

  if (op === "read") {
    const file = searchParams.get("file");
    if (!file) return NextResponse.json({ error: "No file specified" }, { status: 400 });
    const filePath = path.join(ROOT, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ content });
    } catch (e) {
      return NextResponse.json({ content: "", error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid op" }, { status: 400 });
} 