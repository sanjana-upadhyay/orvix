import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateWithRetry(model, prompt, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      const isOverloaded =
        err.message?.includes("503") ||
        err.message?.includes("overloaded") ||
        err.message?.includes("high demand");
      if (isOverloaded && i < retries - 1) {
        console.log(`Model busy, retrying... (attempt ${i + 2}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

function getCategoryInstruction(category) {
  switch (category) {
    case "technical":
      return "Generate all 6 questions as technical/role-specific questions only (no behavioral/HR questions).";
    case "behavioral":
      return "Generate all 6 questions as behavioral/HR questions only (no technical questions).";
    case "system-design":
      return "Generate all 6 questions as system design questions relevant to this role (architecture, scalability, trade-offs).";
    default:
      return "Include a mix of:\n- 3 technical/role-specific questions\n- 3 behavioral/HR questions";
  }
}

export async function POST(req) {
  try {
    const { role, category } = await req.json();

    if (!role || !role.trim()) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const prompt = `You are an expert technical interviewer. Generate 6 interview questions for someone preparing for this role: "${role}".

${getCategoryInstruction(category)}

Respond ONLY with a valid JSON array of strings, nothing else. No markdown, no explanation. Example format:
["Question 1 here", "Question 2 here", "Question 3 here"]`;

    const result = await generateWithRetry(model, prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Gemini is currently busy. Please try again shortly." },
      { status: 500 }
    );
  }
}