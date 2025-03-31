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
      AllowedOrigins: {},
      ChromeSessions: true,
      sessions: true,
      Request: true,
    },
  });
  if (!userData) {
    throw new Error("User not found");
  }

  // Fetch data server-side
  // const origins = await db.allowedOrigin.findMany();
  // const requests = await db.request.findMany();
  // const sessions = await db.chromeSession.findMany();

  return (
    <RenderHome
      session={session}
      initialOrigins={userData.AllowedOrigins}
      initialRequests={userData.Request}
      initialSessions={userData.ChromeSessions}
    />
  );
}
