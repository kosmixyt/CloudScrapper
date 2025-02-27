import { Prisma, User } from "@prisma/client";
import { randomUUID } from "crypto";
import { Session } from "next-auth";
import { NextRequest } from "next/server";
import { db, localsSession, NewBrowser } from "~/server/db";

export async function SessionMiddleWare(user: User, method: string, req: any) {
  try {
    switch (method) {
      case "sessions.create":
        const name = req.session ?? randomUUID();
        var proxy = {
          url: "",
          username: "",
          password: "",
          port: 0,
        };
        if (typeof req.proxy != undefined && req.proxy != null) {
          proxy = ParseProxyUrl(req.proxy);
        }
        const session = await db.chromeSession.create({
          data: {
            proxyHost: proxy.url,
            proxyUsername: proxy.username,
            proxyPassword: proxy.password,
            proxyPort: proxy.port,
            id: name,
            User: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        NewBrowser(session);
        return {
          session: name,
        };
      case "sessions.list":
        const sessions = await db.chromeSession.findMany({
          where: {
            userId: user.id,
          },
        });
        return {
          sessions: sessions.map((session) => session.id),
        };
      case "sessions.destroy":
        await db.chromeSession.delete({
          where: {
            id: req.session,
          },
        });
        if (!localsSession.delete(req.session)) {
          throw new Error("Session not found in local");
        }
        return {};
      default:
        throw new Error("Invalid Method");
    }
  } catch (e) {
    console.error(e);
    throw new Error("Internal Server Error");
  }
}

// from protocol://username:password@host:port to {url, username, password, port}
export function ParseProxyUrl(proxyUrl: string | any): {
  url: string;
  username: string;
  password: string;
  port: number;
} {
  if (typeof proxyUrl === "string") {
    const url = new URL(proxyUrl);

    return {
      url: `${url.protocol}//${url.host}`,
      username: url.username,
      password: url.password,
      port: url.port ? parseInt(url.port) : 0,
    };
  }
  if (typeof proxyUrl === "object") {
    try {
      const url = new URL(proxyUrl.url);
      const username = proxyUrl.username;
      const password = proxyUrl.password;
      const port =
        typeof proxyUrl.port !== "number"
          ? parseInt(proxyUrl.port)
          : proxyUrl.port;
      if (isNaN(port)) {
        throw new Error("Invalid Port");
      }
      return {
        url: `${url.protocol}//${url.host}`,
        username,
        password,
        port,
      };
    } catch (e) {
      console.error(e);
      throw new Error("Invalid Proxy data");
    }
  }
  throw new Error("Invalid Proxy data");
}
