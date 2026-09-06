"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("orvix_sessions") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions(saved);
  }, []);

  const clearHistory = () => {
    if (confirm("Delete all practice history?")) {
      localStorage.removeItem("orvix_sessions");
      setSessions([]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Practice History</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-sm"
          >
            ← Home
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-slate-400 text-center mt-16">
            No practice sessions yet. get started!
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-slate-800 border border-slate-600 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{s.role}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(s.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {s.totalQuestions} questions
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">
                    {s.avgScore}/10
                  </span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={clearHistory}
              className="mt-8 text-sm text-red-400 hover:text-red-300 underline"
            >
              Clear all history
            </button>
          </>
        )}
      </div>
    </main>
  );
}