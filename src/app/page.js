"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("mixed");
  const [resumeText, setResumeText] = useState("");
  const [showResume, setShowResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleStart = () => {
    if (!role.trim()) {
      alert("Please enter your target role first!");
      return;
    }
    setLoading(true);
    sessionStorage.setItem("targetRole", role);
    sessionStorage.setItem("targetCategory", category);
    sessionStorage.setItem("resumeText", resumeText);
    router.push("/questions");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".txt")) {
      alert("Please upload a .txt file. Or paste your resume text directly below.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target.result);
    };
    reader.readAsText(file);
  };

  const categories = [
    { id: "mixed", label: "Mixed", bg: "bg-zinc-900", active: "bg-zinc-600", border: "border-zinc-600" },
    { id: "technical", label: "Technical", bg: "bg-zinc-900", active: "bg-teal-700", border: "border-teal-700" },
    { id: "behavioral", label: "Behavioral", bg: "bg-zinc-900", active: "bg-teal-600", border: "border-teal-600" },
    { id: "system-design", label: "System Design", bg: "bg-zinc-900", active: "bg-zinc-600", border: "border-zinc-600" },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0a] py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-14 h-14 rounded-2xl bg-teal-700 flex items-center justify-center text-white font-extrabold text-2xl mb-4"
      >
        O
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="text-4xl font-extrabold text-center mb-2 text-white"
      >
        Orvix
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-zinc-400 mb-8 text-center max-w-sm font-medium"
      >
        AI-powered mock interviews with instant, actionable feedback.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: "spring" }}
        className="w-full max-w-md bg-zinc-950 rounded-3xl p-6 border-2 border-zinc-800 shadow-lg"
      >
        <label className="text-sm font-bold text-zinc-300 mb-2 block">
          What role are you preparing for?
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Frontend Developer at a startup"
          className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-teal-600 transition font-medium text-sm"
        />

        <label className="text-sm font-bold text-zinc-300 mt-5 mb-2 block">
          Question Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat.id)}
              className={`py-3 px-3 rounded-2xl text-sm font-bold transition border-2 ${
                category === cat.id
                  ? `${cat.active} text-white ${cat.border}`
                  : `${cat.bg} text-zinc-400 border-transparent hover:border-zinc-700`
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => setShowResume(!showResume)}
          className="w-full mt-5 flex items-center justify-between text-sm font-bold text-zinc-300 py-2"
        >
          <span>📄 Personalize with your resume (optional)</span>
          <span className="text-teal-500">{showResume ? "−" : "+"}</span>
        </button>

        {showResume && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-zinc-900 border-2 border-zinc-800 text-zinc-300 hover:border-teal-600"
              >
                Upload .txt file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              {resumeText && (
                <span className="text-xs text-teal-400 self-center font-bold">
                  ✓ Resume loaded
                </span>
              )}
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Or paste your resume text here — AI will tailor questions to your background..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-teal-600 transition text-xs"
            />
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.96, y: 4 }}
          onClick={handleStart}
          disabled={loading}
          className="w-full mt-5 py-4 rounded-2xl bg-teal-700 border-b-4 border-teal-900 active:border-b-0 text-white font-extrabold transition disabled:opacity-50 text-base"
        >
          {loading ? "Loading..." : "Start Practice"}
        </motion.button>
        <button
          onClick={() => router.push("/history")}
          className="w-full mt-3 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 font-bold transition text-sm text-zinc-400"
        >
          View History
        </button>
      </motion.div>
    </main>
  );
}