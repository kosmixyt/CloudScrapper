import { NextRequest, NextResponse } from "next/server";
import { ParseProxyUrl } from "./session";
import { connect, Options } from "puppeteer-real-browser";
import { db, GetBrowser, GetDefaultBrowserOptions } from "~/server/db";
import { AllowedOrigin, Prisma, User } from "@prisma/client";
import * as os from "os";
import { env } from "~/env";

export default async function RequestMiddleware(
  origin: Prisma.AllowedOriginGetPayload<{ include: { User: true } }>,
  command: string,
  pl: any,
): Promise<GetRequestResponse> {
  if (command.includes("post")) {
    throw new Error("unimplemented");
  }
  console.log("GET");
  return new Promise(async (resolve, rejects) => {
    var resolved = false;
    try {
      const url = pl.url;
      const session = pl.session ?? "";
      const onlyCookie = pl.returnOnlyCookie ?? false;
      const ttl = pl.session_ttl_minutes ?? 0;
      const timeout = pl.maxTimeout ?? 60_000;
      const proxy = session.length === "" ? ParseProxyUrl(pl.proxy) : undefined;
      const Reqcookies = ValidateCookies(pl.cookies) ? pl.cookies : [];
      const opt = GetDefaultBrowserOptions();
      if (proxy) {
        opt.proxy = {
          host: proxy.url,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
        };
      }
      const results =
        session.length === 0 ? await connect(opt) : await GetBrowser(session);
      if (!results) throw new Error("Session not found");
      const foFunc = async (): Promise<GetRequestResponse> => {
        // const results = await connect(opt);

        await results.browser.setCookie(...Reqcookies);
        const page = await results.browser.newPage();
        page.setDefaultNavigationTimeout(timeout);
        const haveCfCloudlare = async (): Promise<boolean> => {
          return (
            (await results.browser.cookies()).findIndex(
              (cookie) => cookie.name === "cf_clearance",
            ) !== -1
          );
        };
        const [content, headers]: [string, Record<string, string>] =
          await new Promise((rs) => {
            const on_response = async (response: any) => {
              const requrl = await response.url();
              const ressourceType = response.request().resourceType();
              const isRedirect =
                response.status() >= 300 && response.status() <= 399;
              if (ressourceType === "document" && (await haveCfCloudlare())) {
                var content: string = await response.text();
                if (!content.includes("Just a moment...")) {
                  rs([content, response.headers()]);
                } else {
                  // console.log("Cloudflare detected");
                }
                page.off("response", on_response);
              } else {
                // console.log(
                //   requrl,
                //   `not document (${ressourceType}) (${isRedirect})`,
                // );
              }
            };
            page.on("response", on_response);
            page.goto(url);
          });

        var cookies = await results.browser.cookies();
        cookies = cookies.map((cookie) => {
          return {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            expires: cookie.expires,
            size: cookie.size,
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            session: cookie.session,
            sameSite: cookie.sameSite,
          };
        });
        const ua = await results.browser.userAgent();
        const request = await db.request.create({
          data: {
            method: "GET",
            url,
            allowedOriginId: origin.id,
          },
        });
        await page.screenshot({
          fullPage: true,
          path: `${env.SHOT_PATH}/${request.id}.png`,
        });
        await page.close();
        await results.browser.close();
        console.log(cookies);
        return {
          solution: {
            url,
            status: 200,
            headers: headers,
            response: onlyCookie ? "" : content,
            cookies,
            userAgent: ua,
          },
          status: "ok",
          message: "Success",
          startTimestamp: Date.now(),
          endTimestamp: Date.now(),
          version: "1.0.0",
        };
      };

      setTimeout(() => {
        if (!resolved) rejects("Timeout");
        if (session.length === 0) {
          results.browser.close();
        }
        rejects("Timeout");
      }, timeout);
      foFunc()
        .then((res) => {
          resolved = true;
          resolve(res);
        })
        .catch((e) => {
          if (!resolved) rejects(e);
        });
    } catch (e: unknown) {}
  });
}
export interface GetRequestResponse {
  solution: {
    url: string;
    status: number;
    headers: Record<string, string>;
    response: string;
    cookies: {
      name: string;
      value: string;
      domain: string;
      path: string;
      expires: number;
      size: number;
      httpOnly: boolean;
      secure: boolean;
      session: boolean;
      sameSite?: string;
    }[];
    userAgent: string;
  };
  status: "ok" | "error";
  message: string;
  startTimestamp: number;
  endTimestamp: number;
  version: string;
}

function ValidateCookies(cookies: any): boolean {
  if (!Array.isArray(cookies)) return false;

  return cookies.every((cookie) => {
    return (
      typeof cookie === "object" &&
      cookie !== null &&
      typeof cookie.name === "string" &&
      typeof cookie.value === "string"
    );
  });
}
