"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Questions() {
  const [role] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("targetRole") || "";
    }
    return "";
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [avgScore, setAvgScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);

  const router = useRouter();

  const fetchQuestions = async (role) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setQuestions(data.questions);
    } catch (err) {
      setError("Could not generate questions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!role) {
      router.push("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestions(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[currentIndex],
          answer,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Feedback failed");

      setFeedback(data.feedback);
      setScores((prev) => [...prev, data.feedback.score]);
    } catch (err) {
      console.error(err);
      alert("Could not generate feedback. Please try again.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    if (loading || feedback || sessionDone) return;

   if (timeLeft <= 0) {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  handleSubmitAnswer();
  return;
}

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading, feedback, sessionDone]);

  const saveSessionToHistory = (finalAvgScore) => {
    const session = {
      id: Date.now(),
      role,
      avgScore: parseFloat(finalAvgScore),
      totalQuestions: questions.length,
      date: new Date().toISOString(),
    };
    const existing = JSON.parse(
      localStorage.getItem("orvix_sessions") || "[]"
    );
    existing.unshift(session);
    localStorage.setItem("orvix_sessions", JSON.stringify(existing));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setFeedback(null);
      setTimeLeft(120);
    } else {
      const finalScores = scores;
      const calculatedAvg =
        finalScores.length > 0
          ? (
              finalScores.reduce((a, b) => a + b, 0) / finalScores.length
            ).toFixed(1)
          : 0;
      setAvgScore(calculatedAvg);
      saveSessionToHistory(calculatedAvg);
      setSessionDone(true);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg"
        >
          Generating your interview questions...
        </motion.p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchQuestions(role)}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </main>
    );
  }

  if (sessionDone) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4"
      >
        <h2 className="text-3xl font-bold mb-4">Session Complete! 🎉</h2>
        <p className="text-slate-300 mb-2">Role: {role}</p>
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-5xl font-bold text-blue-400 my-4"
        >
          {avgScore}/10
        </motion.p>
        <p className="text-slate-400 mb-8">Average Score</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push("/history")}
            className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 font-semibold"
          >
            View History
          </button>
        </div>
      </motion.main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4 py-10">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-400 text-sm">
            Question {currentIndex + 1} of {questions.length} — {role}
          </p>
          <p className={`text-sm font-semibold ${timeLeft <= 20 ? "text-red-400" : "text-slate-400"}`}>
            ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </p>
        </div>
        <h2 className="text-2xl font-semibold mb-6">
          {questions[currentIndex]}
        </h2>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          disabled={!!feedback}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />

        {!feedback && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || feedbackLoading}
            className="w-full mt-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition disabled:opacity-50"
          >
            {feedbackLoading ? "Generating feedback..." : "Submit Answer"}
          </motion.button>
        )}

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 bg-slate-800 border border-slate-600 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Feedback</h3>
              <span className="text-2xl font-bold text-blue-400">
                {feedback.score}/10
              </span>
            </div>
            <p className="text-slate-300 mb-2">
              <span className="font-medium text-green-400">Strengths: </span>
              {feedback.strengths}
            </p>
            <p className="text-slate-300">
              <span className="font-medium text-yellow-400">
                Improvements:{" "}
              </span>
              {feedback.improvements}
            </p>
            {feedback.betterAnswerTip && (
              <p className="text-slate-300 mt-2">
                <span className="font-medium text-blue-400">Tip: </span>
                {feedback.betterAnswerTip}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full mt-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
            >
              {currentIndex < questions.length - 1
                ? "Next Question →"
                : "Finish Session"}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}