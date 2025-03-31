"use client";
import { useState } from "react";
import { Tab } from "@headlessui/react";

interface CookieInput {
  name: string;
  value: string;
  domain?: string;
  path?: string;
}

export default function FlareSolverConfigPage() {
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced options
  const [session, setSession] = useState("");
  const [returnOnlyCookie, setReturnOnlyCookie] = useState(false);
  const [sessionTtl, setSessionTtl] = useState(0);
  const [maxTimeout, setMaxTimeout] = useState(60000);
  const [proxy, setProxy] = useState("");
  const [cookies, setCookies] = useState<CookieInput[]>([
    { name: "", value: "" },
  ]);

  const addCookie = () => {
    setCookies([...cookies, { name: "", value: "" }]);
  };

  const updateCookie = (
    index: number,
    field: keyof CookieInput,
    value: string,
  ) => {
    const newCookies = [...cookies];
    newCookies[index] = { ...newCookies[index], [field]: value };
    setCookies(newCookies);
  };

  const removeCookie = (index: number) => {
    setCookies(cookies.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const payload: any = {
        cmd: "request.get",
        url,
      };

      if (showAdvanced) {
        if (session) payload.session = session;
        if (returnOnlyCookie) payload.returnOnlyCookie = returnOnlyCookie;
        if (sessionTtl > 0) payload.session_ttl_minutes = sessionTtl;
        if (maxTimeout !== 60000) payload.maxTimeout = maxTimeout;
        if (proxy) payload.proxy = proxy;

        // Only include cookies with both name and value
        const validCookies = cookies.filter((c) => c.name && c.value);
        if (validCookies.length > 0) payload.cookies = validCookies;
      }

      const res = await fetch("/api/flaresolverr/v1", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScreenshotUrl = () => {
    if (response?.requestId) {
      return `/api/flaresolverr/screenshots/${response.requestId}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">FlareSolver Configurator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mr-4 text-blue-400 hover:underline"
          >
            {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 rounded border border-slate-700 p-4">
            <div>
              <label htmlFor="session" className="block text-sm font-medium">
                Session ID (Optional)
              </label>
              <input
                type="text"
                id="session"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-800 p-2"
                placeholder="Leave empty to create a new session"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="returnOnlyCookie"
                checked={returnOnlyCookie}
                onChange={(e) => setReturnOnlyCookie(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="returnOnlyCookie" className="text-sm">
                Return Only Cookies (No HTML Response)
              </label>
            </div>

            <div>
              <label htmlFor="sessionTtl" className="block text-sm font-medium">
                Session TTL (minutes, 0 for no limit)
              </label>
              <input
                type="number"
                id="sessionTtl"
                value={sessionTtl}
                onChange={(e) => setSessionTtl(parseInt(e.target.value))}
                min="0"
                className="w-full rounded border border-slate-700 bg-slate-800 p-2"
              />
            </div>

            <div>
              <label htmlFor="maxTimeout" className="block text-sm font-medium">
                Max Timeout (milliseconds)
              </label>
              <input
                type="number"
                id="maxTimeout"
                value={maxTimeout}
                onChange={(e) => setMaxTimeout(parseInt(e.target.value))}
                min="1000"
                className="w-full rounded border border-slate-700 bg-slate-800 p-2"
              />
            </div>

            <div>
              <label htmlFor="proxy" className="block text-sm font-medium">
                Proxy URL (Optional)
              </label>
              <input
                type="text"
                id="proxy"
                value={proxy}
                onChange={(e) => setProxy(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-800 p-2"
                placeholder="http://user:pass@host:port"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium">Cookies</label>
                <button
                  type="button"
                  onClick={addCookie}
                  className="text-sm text-blue-400 hover:underline"
                >
                  + Add Cookie
                </button>
              </div>

              {cookies.map((cookie, index) => (
                <div
                  key={index}
                  className="mb-2 rounded border border-slate-700 p-2"
                >
                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={cookie.name}
                      onChange={(e) =>
                        updateCookie(index, "name", e.target.value)
                      }
                      className="flex-1 rounded border border-slate-700 bg-slate-800 p-2"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={cookie.value}
                      onChange={(e) =>
                        updateCookie(index, "value", e.target.value)
                      }
                      className="flex-1 rounded border border-slate-700 bg-slate-800 p-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeCookie(index)}
                      className="rounded bg-red-600 px-2 hover:bg-red-700"
                    >
                      X
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Domain (optional)"
                      value={cookie.domain || ""}
                      onChange={(e) =>
                        updateCookie(index, "domain", e.target.value)
                      }
                      className="flex-1 rounded border border-slate-700 bg-slate-800 p-2"
                    />
                    <input
                      type="text"
                      placeholder="Path (optional)"
                      value={cookie.path || ""}
                      onChange={(e) =>
                        updateCookie(index, "path", e.target.value)
                      }
                      className="flex-1 rounded border border-slate-700 bg-slate-800 p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Send Request"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {response && (
        <div className="mt-6">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-slate-800 p-1">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-700"
                  }`
                }
              >
                Response
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-700"
                  }`
                }
              >
                Cookies
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-700"
                  }`
                }
              >
                Screenshot
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-2">
              <Tab.Panel className="rounded-xl bg-slate-800 p-4">
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-400">Status:</span>
                    <span
                      className={`ml-2 rounded px-2 py-1 text-xs ${
                        response.status === "ok" ? "bg-green-700" : "bg-red-700"
                      }`}
                    >
                      {response.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">URL:</span>
                    <span className="ml-2">{response.solution?.url}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">User-Agent:</span>
                    <span className="ml-2 break-all text-xs">
                      {response.solution?.userAgent}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Time:</span>
                    <span className="ml-2">
                      {(response.endTimestamp - response.startTimestamp) / 1000}
                      s
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-md mb-2 font-semibold">
                    Response Content
                  </h3>
                  <div className="max-h-96 overflow-auto">
                    {response.solution?.response ? (
                      <pre className="whitespace-pre-wrap rounded bg-slate-900 p-3 text-xs">
                        {response.solution.response.length > 1000
                          ? `${response.solution.response.substring(0, 1000)}...`
                          : response.solution.response}
                      </pre>
                    ) : (
                      <p className="italic text-slate-400">
                        No response content available
                      </p>
                    )}
                  </div>
                </div>
              </Tab.Panel>

              <Tab.Panel className="rounded-xl bg-slate-800 p-4">
                {response.solution?.cookies &&
                response.solution.cookies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-300">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-300">
                            Value
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-300">
                            Domain
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-300">
                            Path
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-300">
                            Expires
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {response.solution.cookies.map(
                          (cookie: any, idx: number) => (
                            <tr
                              key={idx}
                              className={
                                idx % 2 === 0 ? "bg-slate-900" : "bg-slate-800"
                              }
                            >
                              <td className="whitespace-nowrap px-4 py-2 text-sm">
                                {cookie.name}
                              </td>
                              <td className="max-w-xs truncate whitespace-nowrap px-4 py-2 text-sm">
                                {cookie.value}
                              </td>
                              <td className="whitespace-nowrap px-4 py-2 text-sm">
                                {cookie.domain}
                              </td>
                              <td className="whitespace-nowrap px-4 py-2 text-sm">
                                {cookie.path}
                              </td>
                              <td className="whitespace-nowrap px-4 py-2 text-sm">
                                {cookie.expires
                                  ? new Date(
                                      cookie.expires * 1000,
                                    ).toLocaleString()
                                  : "Session"}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="italic text-slate-400">No cookies available</p>
                )}
              </Tab.Panel>

              <Tab.Panel className="rounded-xl bg-slate-800 p-4">
                {response.requestId && (
                  <div className="flex flex-col items-center">
                    <img
                      src={`/api/flaresolverr/screenshots/${response.solution?.requestId || "unknown"}`}
                      alt="Page Screenshot"
                      className="max-w-full rounded border border-slate-700"
                    />
                    <a
                      href={`/api/flaresolverr/screenshots/${response.solution?.requestId || "unknown"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-blue-400 hover:underline"
                    >
                      Open Full Size
                    </a>
                  </div>
                )}
                {!response.requestId && (
                  <p className="italic text-slate-400">
                    Screenshot not available
                  </p>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  );
}
