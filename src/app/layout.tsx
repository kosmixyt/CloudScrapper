import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloudflared",
  description: "Infinite Cloudflare Scrapper",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="pointer-events-none fixed inset-0 h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 to-transparent opacity-50"></div>
        {children}
      </body>
    </html>
  );
}
