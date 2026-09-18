"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      router.push("/");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% -5%, rgba(45, 212, 191, 0.30), rgba(59, 130, 246, 0.15), #ffffff 60%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 border border-gray-200 shadow-xl"
        >
          <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">
            {isSignup ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6">
            {isSignup ? "Sign up to save your progress" : "Log in to continue practicing"}
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-semibold text-sm text-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition font-medium text-sm mb-3"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition font-medium text-sm"
          />

          {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleEmailSubmit}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition disabled:opacity-50 text-sm"
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
          </motion.button>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-teal-600 font-bold hover:underline"
            >
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </p>
        </motion.div>
      </main>
    </>
  );
}