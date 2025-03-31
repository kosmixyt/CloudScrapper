"use client";

import Link from "next/link";
import { Home, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar({ username }: { username?: string | null }) {
  const pathname = usePathname();

  // Function to determine if a path is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header className="flex w-full items-center justify-between border-b border-slate-700 bg-slate-800/80 px-6 py-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center">
        <h1 className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
          CloudScrapper
        </h1>
        <nav className="ml-10 hidden md:flex">
          <Link
            href="/"
            className={`mx-3 flex items-center transition-colors ${
              isActive("/") && !isActive("/flaresolverr")
                ? "text-blue-400"
                : "text-white hover:text-blue-400"
            }`}
          >
            <Home size={18} className="mr-1" />
            Dashboard
          </Link>
          <Link
            href="/flaresolverr"
            className={`mx-3 flex items-center transition-colors ${
              isActive("/flaresolverr")
                ? "text-blue-400"
                : "text-white hover:text-blue-400"
            }`}
          >
            <Settings size={18} className="mr-1" />
            FlareSolver
          </Link>
        </nav>
      </div>
      <div className="flex items-center">
        {username && (
          <div className="mr-4 text-white">
            Bonjour,{" "}
            <span className="font-medium text-blue-400">{username}</span>
          </div>
        )}
        <Link
          href={"/api/auth/signout"}
          className="flex items-center rounded-lg bg-slate-700 px-3 py-2 text-white transition-colors hover:bg-slate-600"
        >
          <LogOut size={16} className="mr-2" />
          Déconnexion
        </Link>
      </div>
    </header>
  );
}
