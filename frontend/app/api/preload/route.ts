import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".json",
  ".ttf",
  ".mp3",
  ".wav",
  ".ogg",
  ".glb",
  ".gltf",
]);

async function collectAssets(rootDir: string) {
  const assets: string[] = [];
  const queue = [rootDir];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) {
      continue;
    }
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(entryPath);
      } else if (entry.isFile()) {
        const extension = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(extension)) {
          const relative = path.relative(rootDir, entryPath);
          assets.push(`/${relative.split(path.sep).join("/")}`);
        }
      }
    }
  }

  assets.sort();
  return assets;
}

export async function GET() {
  const publicDir = path.join(process.cwd(), "public");
  const assets = await collectAssets(publicDir);
  return NextResponse.json(
    { assets },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
