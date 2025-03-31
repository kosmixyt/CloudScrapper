import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<Response> {
  try {
    const id = params.id;
    const filePath = path.join(env.SHOT_PATH, `${id}.png`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Screenshot not found", { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Return the image
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error serving screenshot:", error);
    return new NextResponse("Error serving screenshot", { status: 500 });
  }
}
