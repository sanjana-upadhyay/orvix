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
        console.log(`Model busy, retrying feedback... (attempt ${i + 2}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req) {
  try {
    const { question, answer, role } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const prompt = `You are an expert interview coach evaluating a candidate for this role: "${role}".

Question asked: "${question}"
Candidate's answer: "${answer}"

Evaluate this answer critically but constructively, the way a real interviewer would. Consider clarity, relevance, structure (e.g. STAR method for behavioral questions), technical correctness (for technical questions), and confidence conveyed through the writing.

Respond ONLY with valid JSON in this exact format, nothing else, no markdown:
{
  "score": <number 1-10>,
  "strengths": "<specific things the candidate did well, 1-2 sentences, be concrete not generic>",
  "improvements": "<specific, actionable things missing or weak, 1-2 sentences>",
  "betterAnswerTip": "<one concrete suggestion or example phrase that would make the answer stronger, 1-2 sentences>"
}`;

    const result = await generateWithRetry(model, prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const feedback = JSON.parse(cleaned);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Gemini feedback error:", error);
    return NextResponse.json(
      { error: "Gemini is busy now. try again later." },
      { status: 500 }
    );
  }
}