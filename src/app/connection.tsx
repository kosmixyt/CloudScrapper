import Link from "next/link";

export default function Connection() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-1 shadow-xl shadow-slate-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-600/10 opacity-50"></div>
        <div className="relative flex h-80 w-80 flex-col items-center justify-center gap-6 rounded-xl bg-slate-800/95 p-8 text-white">
          <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-blue-300">
              Bienvenue sur
            </div>
            <div className="text-3xl font-bold tracking-tight">
              Cloudflare<span className="text-blue-400">d</span>
            </div>
          </div>

          <Link
            href={"/api/auth/signin"}
            className="transform transition-all duration-300 hover:scale-105"
          >
            <button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
