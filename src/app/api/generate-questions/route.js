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
      return "Include only technical/role-specific questions (no behavioral/HR questions).";
    case "behavioral":
      return "Include only behavioral/HR questions (no technical questions).";
    case "system-design":
      return "Include only system design questions relevant to this role (architecture, scalability, trade-offs).";
    default:
      return "Include a mix of:\n- 3 technical/role-specific questions\n- 3 behavioral/HR questions";
  }
}

function getRoundInstruction(round) {
  switch (round) {
    case "technical":
      return "This is a TECHNICAL ROUND. Focus on coding, system design, tools, and hands-on technical problem-solving relevant to the role.";
    case "managerial":
      return "This is a MANAGERIAL ROUND. Focus on leadership, team management, conflict resolution, prioritization, and decision-making scenarios.";
    default:
      return "This is an HR ROUND. Focus on cultural fit, motivation, career goals, communication, and general behavioral questions.";
  }
}

function getDifficultyInstruction(difficulty) {
  switch (difficulty) {
    case "fresher":
      return "The candidate is a FRESHER / entry-level with little to no professional experience. Keep questions foundational — focus on academic projects, internships, fundamentals, and basic scenarios. Avoid deep, senior-level trade-off questions.";
    case "experienced":
      return "The candidate is EXPERIENCED / senior-level. Ask advanced, nuanced questions involving trade-offs, leadership, scale, ambiguity, and real-world complexity expected of a senior professional.";
    default:
      return "The candidate has INTERMEDIATE experience (a few years). Ask moderately challenging questions that go beyond basics but aren't as advanced as senior-level scenarios.";
  }
}

export async function POST(req) {
  try {
    const { role, category, resumeText, jobDescription, interviewRound, difficulty } = await req.json();

    if (!role || !role.trim()) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const resumeSection =
      resumeText && resumeText.trim()
        ? `\n\nThe candidate's resume/background is below. Use specific details from it (projects, skills, past experience) to make some questions personalized and relevant to their actual background, instead of fully generic questions:\n"""\n${resumeText.trim().slice(0, 3000)}\n"""`
        : "";

    const jdSection =
      jobDescription && jobDescription.trim()
        ? `\n\nHere is the job description for this role. Tailor questions to match its specific requirements, responsibilities, and required skills:\n"""\n${jobDescription.trim().slice(0, 2000)}\n"""`
        : "";

    const prompt = `You are an expert technical interviewer. Generate 6 interview questions for someone preparing for this role: "${role}".

${getRoundInstruction(interviewRound)}

${getDifficultyInstruction(difficulty)}

${getCategoryInstruction(category)}${resumeSection}${jdSection}

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