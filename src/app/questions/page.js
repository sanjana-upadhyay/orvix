"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function Questions() {
  const [role] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("targetRole") || "";
    }
    return "";
  });

  const [category] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("targetCategory") || "mixed";
    }
    return "mixed";
  });

  const [resumeText] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("resumeText") || "";
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

  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);

  const router = useRouter();

  const fetchQuestions = async (role, category, resumeText) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, category, resumeText }),
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
    fetchQuestions(role, category, resumeText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setAnswer("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
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
      category,
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

  const progressPercent = questions.length
    ? ((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100
    : 0;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-xl bg-teal-700 mb-4"
          />
          <p className="text-zinc-400 font-bold text-sm">
            Generating your interview questions...
          </p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
          <p className="text-zinc-300 mb-4 text-sm font-medium">{error}</p>
          <button
            onClick={() => fetchQuestions(role, category, resumeText)}
            className="px-6 py-3 rounded-2xl bg-teal-700 border-b-4 border-teal-900 active:border-b-0 text-white text-sm font-extrabold"
          >
            Try Again
          </button>
        </main>
      </>
    );
  }

  if (sessionDone) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
          <div className="bg-zinc-950 rounded-3xl p-8 text-center max-w-md w-full border-2 border-zinc-800 shadow-lg">
            <h2 className="text-2xl font-extrabold text-white mb-4">Session Complete!</h2>
            <p className="text-zinc-400 text-sm mb-2 font-medium">Role: {role}</p>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-7xl font-extrabold text-teal-500 my-4 tracking-tight"
            >
              {avgScore}<span className="text-2xl text-zinc-600">/10</span>
            </motion.p>
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-8 font-bold">Average Score</p>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3 rounded-2xl bg-teal-700 border-b-4 border-teal-900 active:border-b-0 text-white font-extrabold text-sm"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/history")}
                className="flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 font-bold text-sm text-zinc-400"
              >
                History
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center bg-[#0a0a0a] px-4 py-10">
        <div className="w-full max-w-xl mb-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Leave this session? Your progress won't be saved.")) {
                router.push("/");
              }
            }}
            className="text-zinc-400 hover:text-white text-sm font-bold flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        <div className="w-full max-w-xl mb-4">
          <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border-2 border-zinc-800">
            <motion.div
              className="h-full bg-teal-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="w-full max-w-xl bg-zinc-950 rounded-3xl p-6 border-2 border-zinc-800 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-500 text-xs font-bold">
              Question {currentIndex + 1}/{questions.length} · {role}
            </p>
            <p className={`text-xs font-extrabold tabular-nums px-3 py-1 rounded-full ${timeLeft <= 20 ? "bg-red-950 text-red-400" : "bg-teal-950 text-teal-400"}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-snug">
            {questions[currentIndex]}
          </h2>

          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here, or use the mic to speak..."
              rows={6}
              disabled={!!feedback}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-teal-600 disabled:opacity-60 font-medium text-sm"
            />
            {voiceSupported && !feedback && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleListening}
                type="button"
                title={isListening ? "Stop recording" : "Start voice input"}
                className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition text-sm border-2 ${
                  isListening
                    ? "bg-red-600 border-red-700 text-white"
                    : "bg-zinc-950 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                {isListening ? "⏹" : "🎤"}
              </motion.button>
            )}
          </div>

          {isListening && (
            <p className="text-xs text-red-400 mt-2 font-bold">Listening...</p>
          )}
          {!voiceSupported && (
            <p className="text-xs text-zinc-500 mt-2">
              Voice input isn&apos;t supported here. Try Chrome.
            </p>
          )}

          {!feedback && (
            <motion.button
              whileTap={{ scale: 0.96, y: 4 }}
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || feedbackLoading}
              className="w-full mt-4 py-4 rounded-2xl bg-teal-700 border-b-4 border-teal-900 active:border-b-0 text-white font-extrabold transition disabled:opacity-50 text-sm"
            >
              {feedbackLoading ? "Generating feedback..." : "Submit Answer"}
            </motion.button>
          )}

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mt-6 bg-zinc-900 rounded-2xl p-5 border-2 border-zinc-800"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-zinc-300 text-sm">Feedback</h3>
                <span className="text-2xl font-extrabold text-teal-500">
                  {feedback.score}/10
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-2 leading-relaxed font-medium">
                <span className="font-extrabold text-emerald-400">Strengths — </span>
                {feedback.strengths}
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                <span className="font-extrabold text-amber-400">Improve — </span>
                {feedback.improvements}
              </p>
              {feedback.betterAnswerTip && (
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-medium">
                  <span className="font-extrabold text-teal-400">Tip — </span>
                  {feedback.betterAnswerTip}
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.96, y: 4 }}
                onClick={handleNext}
                className="w-full mt-5 py-4 rounded-2xl bg-teal-700 border-b-4 border-teal-900 active:border-b-0 text-white font-extrabold transition text-sm"
              >
                {currentIndex < questions.length - 1
                  ? "Next Question →"
                  : "Finish Session"}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  );
}