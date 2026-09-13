"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-zinc-800 bg-[#0a0a0a] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-sm">
            O
          </div>
          <span className="text-white font-bold text-sm">Orvix</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pathname === "/" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => router.push("/history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pathname === "/history" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            History
          </button>
        </div>
      </div>
    </nav>
  );
}