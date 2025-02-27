import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sess = await auth();
  if (!sess) {
    return NextResponse.redirect("/api/auth/signin");
  }
  const sessions = await db.chromeSession.findMany({
    where: {
      userId: sess.user.id,
    },
  });
  return NextResponse.json(sessions);
}
