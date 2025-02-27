import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import fs from "fs";
import { env } from "~/env";
import path from "path";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }
  const current = new URL(req.url);
  const request = await db.request.findFirst({
    where: {
      id: current.searchParams.get("id") as string,
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (!fs.existsSync(path.join(env.SHOT_PATH, `${request?.id}.png`))) {
    return NextResponse.json(
      { error: "Screenshot not found" },
      { status: 404 },
    );
  }
  const stream = fs.createReadStream(
    path.join(env.SHOT_PATH, `${request.id}.png`),
  );
  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
