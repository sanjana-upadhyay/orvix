"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (!authLoading && !user) {
    router.push("/login");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, authLoading]);

  const [role, setRole] = useState("");
  const [category, setCategory] = useState("mixed");
  const [interviewRound, setInterviewRound] = useState("hr");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [resumeText, setResumeText] = useState("");
  const [showResume, setShowResume] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleStart = () => {
    if (!role.trim()) {
      alert("Please enter your target role first!");
      return;
    }
    setLoading(true);
    sessionStorage.setItem("targetRole", role);
    sessionStorage.setItem("targetCategory", category);
    sessionStorage.setItem("interviewRound", interviewRound);
    sessionStorage.setItem("difficulty", difficulty);
    sessionStorage.setItem("resumeText", resumeText);
    sessionStorage.setItem("jobDescription", jobDescription);
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
    reader.onload = (event) => setResumeText(event.target.result);
    reader.readAsText(file);
  };

  const categories = [
    { id: "mixed", label: "Mixed" },
    { id: "technical", label: "Technical" },
    { id: "behavioral", label: "Behavioral" },
    { id: "system-design", label: "System Design" },
  ];

  const rounds = [
    { id: "hr", label: "HR Round" },
    { id: "technical", label: "Technical Round" },
    { id: "managerial", label: "Managerial Round" },
  ];

  const difficulties = [
    { id: "fresher", label: "Fresher" },
    { id: "intermediate", label: "Intermediate" },
    { id: "experienced", label: "Experienced" },
  ];

  if (authLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 text-sm font-bold">Loading...</p>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex flex-col items-center px-4 py-16"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% -5%, rgba(45, 212, 191, 0.30), rgba(59, 130, 246, 0.15), #ffffff 60%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6 shadow-sm"
        >
          <span className="text-yellow-500 text-xs">★★★★★</span>
          <span className="text-xs font-semibold text-gray-600">4.9/5 · AI-Powered Practice</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-5xl font-extrabold text-center mb-4 text-gray-900 max-w-xl leading-tight"
        >
          AI Mock Interview Practice
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 mb-10 text-center max-w-md font-medium text-sm"
        >
          Role-specific AI questions, instant feedback, and a personalized prep plan based on your resume.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 border border-gray-200 shadow-xl"
        >
          <label className="text-sm font-bold text-gray-700 mb-2 block">
            What role are you preparing for?
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer at a startup"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition font-medium text-sm"
          />

          <label className="text-sm font-bold text-gray-700 mt-5 mb-2 block">
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((d) => (
              <motion.button
                key={d.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(d.id)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition border-2 ${
                  difficulty === d.id
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-100 text-gray-500 border-transparent hover:border-gray-300"
                }`}
              >
                {d.label}
              </motion.button>
            ))}
          </div>

          <label className="text-sm font-bold text-gray-700 mt-5 mb-2 block">
            Interview Round
          </label>
          <div className="grid grid-cols-3 gap-2">
            {rounds.map((r) => (
              <motion.button
                key={r.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInterviewRound(r.id)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition border-2 ${
                  interviewRound === r.id
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-100 text-gray-500 border-transparent hover:border-gray-300"
                }`}
              >
                {r.label}
              </motion.button>
            ))}
          </div>

          <label className="text-sm font-bold text-gray-700 mt-5 mb-2 block">
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
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-100 text-gray-500 border-transparent hover:border-gray-300"
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => setShowResume(!showResume)}
            className="w-full mt-5 flex items-center justify-between text-sm font-bold text-gray-700 py-2"
          >
            <span>Personalize with your resume (optional)</span>
            <span className="text-teal-600">{showResume ? "−" : "+"}</span>
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
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-teal-500"
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
                  <span className="text-xs text-teal-600 self-center font-bold">✓ Resume loaded</span>
                )}
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Or paste your resume text here..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition text-xs"
              />
            </motion.div>
          )}

          <button
            onClick={() => setShowJD(!showJD)}
            className="w-full mt-3 flex items-center justify-between text-sm font-bold text-gray-700 py-2"
          >
            <span>Paste a job description (optional)</span>
            <span className="text-teal-600">{showJD ? "−" : "+"}</span>
          </button>

          {showJD && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here — questions will be tailored to it..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition text-xs"
              />
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            disabled={loading}
            className="w-full mt-5 py-3.5 rounded-full bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-bold transition disabled:opacity-50 text-sm shadow-lg shadow-teal-500/20"
          >
            {loading ? "Loading..." : "Start Practicing Free →"}
          </motion.button>
        </motion.div>
      </main>
    </>
  );
}