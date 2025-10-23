import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const AI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }
    const model = AI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert code reviewer. Analyze the following ${language} code and provide improvements.
                    Code to review:
                    \`\`\`${language}
                    ${code}
                    \`\`\`

                    You must respond with a valid JSON object with the following structure:
                    {
                    "improvedCode": "the improved version of the code",
                    "explanation": "a short message (1-2 sentences) explaining the main improvement",
                    "category": "one of: Best Practices, Better Performance, Bug Fix, Code Quality, Security Fix"
                    }

                    Rules:
                    1. Only provide ONE improvement at a time (the most important one)
                    2. The category must be EXACTLY one of the five options listed
                    3. Keep the explanation concise and clear
                    4. Make sure the improvedCode is valid ${language} code
                    5. If the code is already perfect, still provide a minor suggestion or alternative approach
                    6. Return ONLY the JSON object, no additional text or markdown

                    Respond with valid JSON only:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const reviewData = JSON.parse(jsonMatch[0]);

    if (!reviewData.improvedCode || !reviewData.explanation || !reviewData.category) {
      throw new Error('Incomplete review data');
    }

    const validCategories = ['Best Practices', 'Better Performance', 'Bug Fix', 'Code Quality', 'Security Fix'];
    if (!validCategories.includes(reviewData.category)) {
      reviewData.category = 'Best Practices';
    }

    return NextResponse.json({
      success: true,
      review: reviewData
    });
  } catch (e) {
    console.error('Error reviewing code:', e);
    return NextResponse.json(
      { error: 'Failed to review code', details: e.message },
      { status: 500 }
    );
  }
}
