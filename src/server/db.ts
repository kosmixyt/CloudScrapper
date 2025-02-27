import { ChromeSession, PrismaClient } from "@prisma/client";
import {
  Mutex,
  MutexInterface,
  Semaphore,
  SemaphoreInterface,
  withTimeout,
} from "async-mutex";

import { connect, ConnectResult, Options } from "puppeteer-real-browser";

import { env } from "~/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();
export const localsSession = new Map<string, ConnectResult>();

export async function GetBrowser(
  id: string,
): Promise<ConnectResult | undefined> {
  return localsSession.get(id);
}

export function GetDefaultBrowserOptions(): Options {
  return {
    headless: false,
    args: [],
    turnstile: true,
  };
}

export async function NewBrowser(
  withSession: ChromeSession,
): Promise<[string, ConnectResult]> {
  const opt = GetDefaultBrowserOptions();
  if (withSession.proxyHost.length > 0) {
    opt.proxy = {
      host: withSession.proxyHost,
      port: withSession.proxyPort,
      username: withSession.proxyUsername,
      password: withSession.proxyPassword,
    };
  }
  const result = await connect(opt);
  localsSession.set(withSession.id, result);
  return [withSession.id, result];
}

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
