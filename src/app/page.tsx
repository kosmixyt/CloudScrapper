import Link from "next/link";
import { auth } from "~/server/auth";
import Connection from "./connection";
import { db } from "~/server/db";
import RenderHome from "./home";
import { user } from "@heroui/theme";
export default async function HomePage() {
  const session = await auth();
  console.log(session);
  if (!session) {
    return <Connection />;
  }
  const userData = await db.user.findFirst({
    where: { id: session.user.id },
    include: {
      AllowedOrigins: true,
      ChromeSessions: true,
      sessions: true,
    },
  });
  if (!userData) {
    throw new Error("User not found");
  }
  return <RenderHome session={session} />;
}
