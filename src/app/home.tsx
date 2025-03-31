"use client";
import {
  AllowedOrigin,
  ChromeSession,
  Prisma,
  Request,
  User,
} from "@prisma/client";
import { Session } from "next-auth";
import Link from "next/link";
import { AddOrigin, DeleteOrigin, DeleteSession } from "./action";
import { useEffect, useState } from "react";

export default function RenderHome(props: { session: Session }) {
  const [origins, setOrigins] = useState<AllowedOrigin[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [sessions, setSessions] = useState<ChromeSession[]>([]);
  useEffect(() => {
    fetchOrigins().then(setOrigins);
    fetchRequests().then(setRequests);
    fetchSessions().then(setSessions);
  }, []);
  const onDeleteOrigin = async (formData: FormData) => {
    const res = await DeleteOrigin(formData);
    if (res.success) fetchOrigins().then((data) => setOrigins(data));
  };
  const onSubmitOrigin = async (formData: FormData) => {
    const res = await AddOrigin(formData);
    if (res.success) fetchOrigins().then((data) => setOrigins(data));
  };
  const onDeleteChromeSession = async (formData: FormData) => {
    const res = await DeleteSession(formData);
    if (res.success) fetchSessions().then((data) => setSessions(data));
  };
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-4 shadow-xl shadow-slate-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-600/10 opacity-50"></div>
        <div className="relative rounded-xl bg-slate-800/95 p-8 text-white">
          <div className="mb-6 text-center text-3xl font-semibold text-white">
            <span className="text-blue-300">Salut </span>
            {props.session.user.name}
            <Link
              href={"/api/auth/signout"}
              className="text-purple-400 hover:text-purple-300"
            >
              {" "}
              - Deconnection
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="relative overflow-hidden rounded-xl bg-slate-800/80 p-5 text-center text-xl text-white shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5"></div>
              <div className="relative">
                <div className="mb-4 font-bold text-blue-300">
                  Allowed Hosts
                </div>
                {origins.length === 0 && <div>No allowed origin</div>}
                <div>
                  {origins.map((origin) => (
                    <div key={origin.id}>
                      <form action={onDeleteOrigin} className="">
                        <div className="mb-2 flex items-center justify-around gap-3">
                          <input
                            name="origin"
                            value={origin.id}
                            type="hidden"
                          />
                          <div>{origin.origin}</div>
                          <button
                            type="submit"
                            className="rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-3 py-1 text-sm font-medium shadow-md hover:shadow-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </form>
                    </div>
                  ))}
                  <div>
                    <form action={onSubmitOrigin} className="mt-4">
                      <input
                        name="origin"
                        className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                        type="text"
                        placeholder="Enter origin URL"
                      />
                      <button
                        type="submit"
                        className="ml-3 mt-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                      >
                        Ajouter
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-96 overflow-hidden rounded-xl bg-slate-800/80 p-5 text-center text-xl text-white shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5"></div>
              <div className="relative">
                <div className="mb-4 font-bold text-blue-300">
                  Chrome Sessions
                </div>
                {sessions.length === 0 && <div>No chrome session</div>}
                <div className="px-4">
                  {sessions.map((session) => (
                    <div key={session.id}>
                      <form
                        action={onDeleteChromeSession}
                        className="mb-2 flex items-center justify-center gap-4"
                      >
                        <input
                          name="session"
                          value={session.id}
                          type="hidden"
                        />
                        <div>{session.id}</div>
                        <button
                          type="submit"
                          className="rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-3 py-1 text-sm font-medium shadow-md hover:shadow-red-500/30"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-slate-800/80 p-5 text-center text-xl text-white shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5"></div>
              <div className="relative">
                <div className="mb-4 font-bold text-blue-300">Requests</div>
                {requests.length === 0 && <div>No Request History</div>}
                <div className="px-4">
                  {requests.map((req) => (
                    <div
                      className="mb-2 flex items-center justify-center gap-2"
                      key={req.id}
                    >
                      <div>{req.id}</div>
                      <div className="rounded-md bg-slate-700 px-2">
                        {req.method}
                      </div>
                      <div className="text-blue-300 underline">
                        <Link href={req.url}>{new URL(req.url).hostname}</Link>
                      </div>
                      <div>
                        <Link
                          href={`/api/front/shot?id=${req.id}`}
                          className="text-purple-400 underline hover:text-purple-300"
                        >
                          ScreenShot
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-slate-800/80 p-5 text-center text-xl text-white shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5"></div>
              <div className="relative">
                <div className="mb-4 font-bold text-blue-300">
                  FlareSolver Config
                </div>
                <Link
                  href="/flaresolverr"
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                >
                  Accéder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function fetchOrigins(): Promise<AllowedOrigin[]> {
  return fetch("/api/front/host/").then((res) => res.json());
}
function fetchSessions(): Promise<ChromeSession[]> {
  return fetch("/api/front/session/").then((res) => res.json());
}
function fetchRequests(): Promise<Request[]> {
  return fetch("/api/front/request/").then((res) => res.json());
}
