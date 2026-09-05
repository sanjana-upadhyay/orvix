import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { question, answer, role } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert interview coach evaluating a candidate for this role: "${role}".

Question asked: "${question}"
Candidate's answer: "${answer}"

Give constructive feedback on this answer. Respond ONLY with valid JSON in this exact format, nothing else:
{
  "score": <number 1-10>,
  "strengths": "<what was good about the answer, 1-2 sentences>",
  "improvements": "<what was missing or could be better, 1-2 sentences>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const feedback = JSON.parse(cleaned);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Gemini feedback error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}