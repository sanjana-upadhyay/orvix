import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { role } = await req.json();

    if (!role || !role.trim()) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert technical interviewer. Generate 6 interview questions for someone preparing for this role: "${role}".

Include a mix of:
- 3 technical/role-specific questions
- 3 behavioral/HR questions

Respond ONLY with a valid JSON array of strings, nothing else. No markdown, no explanation. Example format:
["Question 1 here", "Question 2 here", "Question 3 here"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean response (remove markdown code fences if present)
    const cleaned = text.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}