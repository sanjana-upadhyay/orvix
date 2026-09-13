"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
            O
          </div>
          <span className="text-gray-900 font-bold text-sm">Orvix</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pathname === "/" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => router.push("/history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pathname === "/history" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            History
          </button>
        </div>
      </div>
    </nav>
  );
}