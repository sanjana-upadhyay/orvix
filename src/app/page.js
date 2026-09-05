"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    if (!role.trim()) {
      alert("Pehle apna target role likho!");
      return;
    }
    setLoading(true);
    sessionStorage.setItem("targetRole", role);
    router.push("/questions");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">
        Orvix 🎯
      </h1>
      <p className="text-slate-300 mb-8 text-center max-w-md">
        AI-powered mock interview practice. Apna target role daalo, aur practice shuru karo.
      </p>

      <div className="w-full max-w-md">
      
  <input
    type="text"
    value={role}
    onChange={(e) => setRole(e.target.value)}
    placeholder="e.g. Frontend Developer at a startup"
    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <button
    onClick={handleStart}
    disabled={loading}
    className="w-full mt-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition disabled:opacity-50"
  >
    {loading ? "Loading..." : "Start Practice →"}
  </button>
  <button
    onClick={() => router.push("/history")}
    className="w-full mt-3 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold transition"
  >
    View History
  </button>
</div>
      
    </main>
  );
}