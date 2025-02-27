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
    <div className="flex justify-center">
      <div>
        <div className="mt-4 text-center text-3xl font-semibold text-white underline">
          Salut {props.session.user.name}
          <Link href={"/api/auth/signout"}> - Deconnection</Link>
        </div>
        <div className="flex justify-center gap-4">
          <div className="mt-6 rounded-lg border-2 border-white p-4 text-center text-2xl text-white">
            <div>Allowed Hosts</div>
            {origins.length === 0 && <div>No allowed origin</div>}
            <div>
              {origins.map((origin) => (
                <div key={origin.id}>
                  <form action={onDeleteOrigin} className="">
                    <div className="flex justify-around">
                      <input name="origin" value={origin.id} type="hidden" />
                      <div>{origin.origin}</div>
                      <input
                        type="submit"
                        className="cursor-pointer rounded-lg"
                        value="Delete"
                      />
                    </div>
                  </form>
                </div>
              ))}
              <div>
                <form action={onSubmitOrigin} className="mt-4">
                  <input
                    name="origin"
                    className="rounded-lg text-black"
                    type="text"
                  />
                  <input
                    type="submit"
                    value="Ajouter"
                    className="ml-3 mt-4 cursor-pointer rounded-lg bg-slate-950 p-2"
                  />
                </form>
              </div>
            </div>
          </div>
          <div className="mt-6 w-96 rounded-lg border-2 border-white p-4 text-center text-2xl text-white">
            <div>Chrome Sessions</div>
            {sessions.length === 0 && <div>No chrome session</div>}
            <div className="px-4">
              {sessions.map((session) => (
                <div key={session.id}>
                  <form
                    action={onDeleteChromeSession}
                    className="flex justify-center gap-4"
                  >
                    <input name="session" value={session.id} type="hidden" />
                    <div>{session.id}</div>
                    <input
                      type="submit"
                      value="Delete"
                      className="cursor-pointer"
                    />
                  </form>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 rounded-lg border-2 border-white p-4 text-center text-2xl text-white">
            <div>Requests</div>
            {sessions.length === 0 && <div>No Request History</div>}
            <div className="px-4">
              {requests.map((req) => (
                <div className="flex gap-2" key={req.id}>
                  <div>{req.id}</div>
                  <div>{req.method}</div>
                  <div className="underline">
                    <Link href={req.url}>{new URL(req.url).hostname}</Link>
                  </div>
                  <div>
                    <Link href={`/api/front/shot?id=${req.id}`}>
                      ScreenShot
                    </Link>
                  </div>
                </div>
              ))}
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
