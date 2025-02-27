import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }
  const requests = await db.request.findMany({
    where: {
      AllowedOrigin: {
        User: {
          id: session.user.id,
        },
      },
    },
  });
  return NextResponse.json(requests);
}
