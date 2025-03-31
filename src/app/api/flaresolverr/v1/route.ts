import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { SessionMiddleWare } from "./session";
import RequestMiddleware from "./reqGet";
import { db } from "~/server/db";
import { User } from "@prisma/client";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(
    JSON.stringify({
      error: "Method Not allowed.",
      status_code: 405,
    }),
    {
      status: 405,
    },
  );
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for");
  console.log(ip);
  if (!ip) {
    return new NextResponse(
      JSON.stringify({
        error: "Missing x-forwarded-for header",
      }),
      {
        status: 400,
      },
    );
  }
  // const user = await db.user.findFirst({
  //   where: {
  //     AllowedOrigins: {
  //       some: {
  //         origin: {
  //           equals: ip,
  //         },
  //       },
  //     },
  //   },
  // });
  const origin = await db.allowedOrigin.findFirst({
    where: {
      origin: ip,
    },
    include: {
      User: true,
    },
  });
  if (!origin) {
    return new NextResponse(
      JSON.stringify({
        error: `Origin ${req.headers.get("x-forwarded-for")} not allowed`,
      }),
      {
        status: 401,
      },
    );
  }
  try {
    const bodyJson = await req.json();
    const command: string = bodyJson.cmd;
    console.log(`Received command: ${command}`); // Log de la commande reçue
    if (!command) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing command",
        }),
        {
          status: 400,
        },
      );
    }
    if (command.startsWith("sessions.")) {
      const res = await SessionMiddleWare(
        origin.User as User,
        command,
        bodyJson,
      );
      return new NextResponse(JSON.stringify(res), {
        status: 200,
      });
    }
    if (command.startsWith("request.")) {
      const res = await RequestMiddleware(origin, command, bodyJson);
      return new NextResponse(JSON.stringify(res), {
        status: 200,
      });
    }
    return new NextResponse(
      JSON.stringify({ error: "Bad Request: Unknown command" }),
      {
        status: 400,
      },
    );
  } catch (e: unknown) {
    console.error("Error processing request:", e); // Log de l'erreur
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
      },
    );
  }
}
