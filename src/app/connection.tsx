import Link from "next/link";

export default function Connection() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex h-72 w-72 items-center justify-center rounded-xl bg-slate-700 text-white">
        <Link href={"/api/auth/signin"}>
          <div className="text-center">Cloudflares</div>
          <div className="text-3xl">Connexion</div>
        </Link>
      </div>
    </div>
  );
}
