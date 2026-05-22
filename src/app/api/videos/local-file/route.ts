import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), "public", "videos");

    if (!fs.existsSync(videosDir)) {
      return NextResponse.json({ file: null }, { status: 200 });
    }

    const files = fs.readdirSync(videosDir);
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mkv", ".avi", ".mov"];

    const videoFile = files.find((file) => {
      const ext = path.extname(file).toLowerCase();
      return videoExtensions.includes(ext);
    });

    if (!videoFile) {
      return NextResponse.json({ file: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        file: {
          name: videoFile,
          url: `/videos/${videoFile}`,
          extension: path.extname(videoFile).toLowerCase(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to check local video directory:", error);
    return NextResponse.json(
      { error: "Failed to scan local video folder" },
      { status: 500 }
    );
  }
}
