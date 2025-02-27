import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }
  const Origins = await db.allowedOrigin.findMany({
    where: {
      userId: session.user.id,
    },
  });
  return NextResponse.json(Origins);
}
