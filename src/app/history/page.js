"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  const uniqueDates = [
    ...new Set(
      sessions.map((s) => new Date(s.date).toISOString().split("T")[0])
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

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

const categoryStyles = {
  technical: "bg-teal-950 text-teal-400",
  behavioral: "bg-teal-950 text-teal-400",
  "system-design": "bg-zinc-800 text-zinc-400",
  mixed: "bg-zinc-800 text-zinc-400",
};

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
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-white">Practice History</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-sm text-zinc-400 font-bold"
          >
            ← Home
          </button>
        </div>

        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            className="bg-teal-950/40 rounded-3xl p-4 mb-6 flex items-center gap-3 border-2 border-teal-900"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white font-extrabold text-sm">
              {streak}
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">
                {streak} day{streak > 1 ? "s" : ""} streak!
              </p>
              <p className="text-xs text-zinc-400 font-medium">
                Keep practicing daily to grow your streak.
              </p>
            </div>
          </motion.div>
        )}

        {sessions.length === 0 ? (
          <p className="text-zinc-500 text-center mt-16 text-sm font-bold">
            No sessions yet. Let&apos;s start practicing!
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", delay: i * 0.04 }}
                  className="bg-zinc-950 rounded-2xl p-4 flex items-center justify-between border-2 border-zinc-800 hover:border-zinc-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-extrabold text-white text-sm">{s.role}</p>
                      {s.category && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryStyles[s.category] || categoryStyles.mixed}`}>
                          {s.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">
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
                  <span className="text-lg font-extrabold text-teal-500">
                    {s.avgScore}/10
                  </span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={clearHistory}
              className="mt-8 text-xs text-red-400 hover:text-red-300 underline font-bold"
            >
              Clear all history
            </button>
          </>
        )}
      </div>
    </main>
  );
}