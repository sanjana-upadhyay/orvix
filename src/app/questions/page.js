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

  const [jobDescription] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("jobDescription") || "";
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

  const fetchQuestions = async (role, category, resumeText, jobDescription) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, category, resumeText, jobDescription }),
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
    fetchQuestions(role, category, resumeText, jobDescription);
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
        <main className="min-h-screen flex flex-col items-center justify-center bg-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-xl bg-teal-600 mb-4"
          />
          <p className="text-gray-500 font-bold text-sm">
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
        <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
          <p className="text-gray-600 mb-4 text-sm font-medium">{error}</p>
          <button
            onClick={() => fetchQuestions(role, category, resumeText, jobDescription)}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold"
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
        <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full border border-gray-200 shadow-xl">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Session Complete!</h2>
            <p className="text-gray-500 text-sm mb-2 font-medium">Role: {role}</p>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-7xl font-extrabold text-teal-600 my-4 tracking-tight"
            >
              {avgScore}<span className="text-2xl text-gray-300">/10</span>
            </motion.p>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-8 font-bold">Average Score</p>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/history")}
                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-600"
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
      <main className="min-h-screen flex flex-col items-center bg-white px-4 py-10">
        <div className="w-full max-w-xl mb-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Leave this session? Your progress won't be saved.")) {
                router.push("/");
              }
            }}
            className="text-gray-500 hover:text-gray-900 text-sm font-bold flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        <div className="w-full max-w-xl mb-4">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              className="h-full bg-teal-500 rounded-full"
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
          className="w-full max-w-xl bg-white rounded-3xl p-6 border border-gray-200 shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-bold">
              Question {currentIndex + 1}/{questions.length} · {role}
            </p>
            <p className={`text-xs font-extrabold tabular-nums px-3 py-1 rounded-full ${timeLeft <= 20 ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-700"}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 leading-snug">
            {questions[currentIndex]}
          </h2>

          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here, or use the mic to speak..."
              rows={6}
              disabled={!!feedback}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 disabled:opacity-60 font-medium text-sm"
            />
            {voiceSupported && !feedback && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleListening}
                type="button"
                title={isListening ? "Stop recording" : "Start voice input"}
                className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition text-sm border-2 ${
                  isListening
                    ? "bg-red-500 border-red-600 text-white"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                {isListening ? "⏹" : "🎤"}
              </motion.button>
            )}
          </div>

          {isListening && (
            <p className="text-xs text-red-500 mt-2 font-bold">Listening...</p>
          )}
          {!voiceSupported && (
            <p className="text-xs text-gray-400 mt-2">
              Voice input isn&apos;t supported here. Try Chrome.
            </p>
          )}

          {!feedback && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || feedbackLoading}
              className="w-full mt-4 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition disabled:opacity-50 text-sm"
            >
              {feedbackLoading ? "Generating feedback..." : "Submit Answer"}
            </motion.button>
          )}

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mt-6 bg-gray-50 rounded-2xl p-5 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-gray-700 text-sm">Feedback</h3>
                <span className="text-2xl font-extrabold text-teal-600">
                  {feedback.score}/10
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2 leading-relaxed font-medium">
                <span className="font-extrabold text-emerald-600">Strengths — </span>
                {feedback.strengths}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                <span className="font-extrabold text-amber-600">Improve — </span>
                {feedback.improvements}
              </p>
              {feedback.betterAnswerTip && (
                <p className="text-gray-600 text-sm mt-2 leading-relaxed font-medium">
                  <span className="font-extrabold text-teal-600">Tip — </span>
                  {feedback.betterAnswerTip}
                </p>
              )}
              {feedback.sampleAnswer && (
                <div className="mt-3 bg-white rounded-xl p-3 border border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                    Sample Answer
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feedback.sampleAnswer}
                  </p>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="w-full mt-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition text-sm"
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