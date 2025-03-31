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
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
  Globe,
  Monitor,
  Activity,
} from "lucide-react";
import Navbar from "~/components/Navbar";

export default function RenderHome(props: {
  session: Session;
  initialOrigins: AllowedOrigin[];
  initialRequests: Request[];
  initialSessions: ChromeSession[];
}) {
  const [origins, setOrigins] = useState<AllowedOrigin[]>(props.initialOrigins);
  const [requests, setRequests] = useState<Request[]>(props.initialRequests);
  const [sessions, setSessions] = useState<ChromeSession[]>(
    props.initialSessions,
  );

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Calculate total pages
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return requests.slice(startIndex, endIndex);
  };

  // Page navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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

  const refreshOrigins = async () => {
    const data = await fetchOrigins();
    setOrigins(data);
  };

  const refreshRequests = async () => {
    const data = await fetchRequests();
    setRequests(data);
    setCurrentPage(1); // Reset to first page after refresh
  };

  const refreshSessions = async () => {
    const data = await fetchSessions();
    setSessions(data);
  };

  // Update the Navbar with the user's name
  useEffect(() => {
    // We'll just use the global Navbar, so this is empty now
  }, []);

  return (
    <div className="flex flex-col bg-slate-900">
      {/* The Navbar is now in the layout.tsx file */}

      {/* Main content */}
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {/* Allowed Hosts Card */}
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-600 bg-slate-700/50 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center text-base font-bold text-blue-300 md:text-lg">
                <Globe size={18} className="mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Allowed Hosts</span>
              </div>
              <button
                onClick={refreshOrigins}
                className="rounded-full bg-blue-600/30 p-1.5 transition-colors hover:bg-blue-600/50"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="p-3 md:p-5">
              {origins.length === 0 && (
                <div className="py-4 text-center text-slate-400">
                  No allowed origin
                </div>
              )}
              <div className="space-y-2">
                {origins.map((origin) => (
                  <div
                    key={origin.id}
                    className="rounded-lg bg-slate-700/50 p-2 md:p-3"
                  >
                    <form
                      action={onDeleteOrigin}
                      className="flex items-center justify-between"
                    >
                      <input name="origin" value={origin.id} type="hidden" />
                      <div className="max-w-[150px] truncate text-white md:max-w-[200px]">
                        {origin.origin}
                      </div>
                      <button
                        type="submit"
                        className="rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-2 py-1 text-xs font-medium shadow-md hover:shadow-red-500/30 md:text-sm"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
                <form action={onSubmitOrigin} className="mt-4 space-y-3">
                  <input
                    name="origin"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                    type="text"
                    placeholder="Enter origin URL"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-medium shadow-lg transition-all hover:shadow-blue-500/30"
                  >
                    Add Origin
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Chrome Sessions Card */}
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-600 bg-slate-700/50 px-6 py-4">
              <div className="flex items-center text-lg font-bold text-blue-300">
                <Monitor size={20} className="mr-2" />
                Chrome Sessions
              </div>
              <button
                onClick={refreshSessions}
                className="rounded-full bg-blue-600/30 p-1.5 transition-colors hover:bg-blue-600/50"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="p-5">
              {sessions.length === 0 && (
                <div className="py-4 text-center text-slate-400">
                  No chrome session
                </div>
              )}
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg bg-slate-700/50 p-3"
                  >
                    <form
                      action={onDeleteChromeSession}
                      className="flex items-center justify-between"
                    >
                      <input name="session" value={session.id} type="hidden" />
                      <div className="text-white">{session.id}</div>
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

          {/* FlareSolver Card */}
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-600 bg-slate-700/50 px-6 py-4">
              <div className="flex items-center text-lg font-bold text-blue-300">
                <Settings size={20} className="mr-2" />
                FlareSolver Config
              </div>
            </div>
            <div className="flex items-center justify-center p-10">
              <Link
                href="/flaresolverr"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
              >
                Configure FlareSolver
              </Link>
            </div>
          </div>

          {/* Requests Card - Takes full width on all screen sizes */}
          <div className="col-span-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between border-b border-slate-600 bg-slate-700/50 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center text-base font-bold text-blue-300 md:text-lg">
                <Activity size={18} className="mr-1 md:mr-2" />
                <span className="whitespace-nowrap">Requests History</span>
              </div>
              <button
                onClick={refreshRequests}
                className="rounded-full bg-blue-600/30 p-1.5 transition-colors hover:bg-blue-600/50"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="p-3 md:p-5">
              {requests.length === 0 && (
                <div className="py-4 text-center text-slate-400">
                  No Request History
                </div>
              )}

              {requests.length > 0 && (
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full text-left text-white">
                    <thead className="bg-slate-700/50 text-xs uppercase md:text-sm">
                      <tr>
                        <th className="rounded-l-lg px-2 py-2 md:px-4 md:py-3">
                          ID
                        </th>
                        <th className="px-2 py-2 md:px-4 md:py-3">Method</th>
                        <th className="px-2 py-2 md:px-4 md:py-3">Host</th>
                        <th className="rounded-r-lg px-2 py-2 md:px-4 md:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentPageItems().map((req) => (
                        <tr
                          key={req.id}
                          className="border-b border-slate-700 bg-slate-700/20"
                        >
                          <td className="px-2 py-2 md:px-4 md:py-3">
                            {req.id}
                          </td>
                          <td className="px-2 py-2 md:px-4 md:py-3">
                            <span className="rounded-md bg-slate-600 px-1 py-0.5 text-xs md:px-2 md:py-1">
                              {req.method}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-blue-300 md:px-4 md:py-3">
                            <Link href={req.url} className="hover:underline">
                              {new URL(req.url).hostname}
                            </Link>
                          </td>
                          <td className="px-2 py-2 md:px-4 md:py-3">
                            <Link
                              href={`/api/front/shot?id=${req.id}`}
                              className="text-purple-400 hover:text-purple-300 hover:underline"
                            >
                              Screenshot
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {requests.length > 0 && (
                <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-4">
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`rounded-md p-1.5 ${
                        currentPage === 1
                          ? "cursor-not-allowed text-gray-500"
                          : "bg-slate-700 text-white hover:bg-slate-600"
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="flex space-x-2">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          // Show different page numbers based on current page
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => goToPage(pageNum)}
                              className={`h-8 w-8 rounded-md ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                  : "bg-slate-700 hover:bg-slate-600"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`rounded-md p-1.5 ${
                        currentPage === totalPages
                          ? "cursor-not-allowed text-gray-500"
                          : "bg-slate-700 text-white hover:bg-slate-600"
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
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
