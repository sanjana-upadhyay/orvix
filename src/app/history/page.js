"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  // Get unique dates (just the date part, no time) sorted descending
  const uniqueDates = [
    ...new Set(
      sessions.map((s) => new Date(s.date).toISOString().split("T")[0])
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  // Streak only counts if the most recent practice was today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffDays = Math.round((current - next) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("orvix_sessions") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions(saved);
    
    setStreak(calculateStreak(saved));
  }, []);

  const clearHistory = () => {
    if (confirm("Delete all practice history?")) {
      localStorage.removeItem("orvix_sessions");
      setSessions([]);
      setStreak(0);
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

        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-lg p-4 mb-6 flex items-center gap-3"
          >
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-bold text-lg">
                {streak} day{streak > 1 ? "s" : ""} streak!
              </p>
              <p className="text-sm text-slate-300">
                Keep practicing daily to grow your streak.
              </p>
            </div>
          </motion.div>
        )}

        {sessions.length === 0 ? (
          <p className="text-slate-400 text-center mt-16">
           No practice sessions yet. Let&apos;s get started!
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
                      {s.category && s.category !== "mixed" && (
                        <> · {s.category}</>
                      )}
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