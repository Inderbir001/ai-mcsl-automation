import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

// Initialize Groq using the OpenAI SDK format
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    // 1. Read the App Memory (RAG context)
    let uiContext = "No specific UI context provided.";
    try {
      const yamlPath = path.join(
        process.cwd(),
        "knowledge-bank",
        "target-app.yaml",
      );
      uiContext = await fs.readFile(yamlPath, "utf-8");
    } catch (e) {
      console.log(
        "No YAML context found. AI will generate based on general knowledge.",
      );
    }

    // 2. The Master Prompt for QA Automation
    const prompt = `Task: Generate QA Automation assets.
Requirement: ${title} - ${description}
App Structure (YAML): ${uiContext}

Instructions:
- Acceptance Criteria should be a numbered list.
- BDD Scenarios must use Gherkin syntax.
- Step Definitions must be valid TypeScript using @cucumber/cucumber and playwright.
- IMPORTANT: Use the exact locators and roles provided in the YAML context.

Response Format (Strict JSON):
{
  "acceptanceCriteria": "...",
  "bddScenarios": "...",
  "stepDefinitions": "import { Given, When, Then } from '@cucumber/cucumber';\\nimport { expect } from '@playwright/test';\\n..."
}`;

    // --- PLAN A: GROQ (Cloud) ---
    try {
      console.log("⚡ Attempting Groq AI...");
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");

      return NextResponse.json({
        success: true,
        source: "Groq Cloud",
        ac: data.acceptanceCriteria,
        bdd: data.bddScenarios,
        steps: data.stepDefinitions,
      });
    } catch (groqError) {
      console.log("⚠️ Groq unavailable. Pivoting to Local Qwen2.5-Coder...");

      // --- PLAN B: OLLAMA (Local Safety Net) ---
      const ollamaResponse = await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
          method: "POST",
          body: JSON.stringify({
            model: "qwen2.5-coder:7b",
            prompt: prompt,
            format: "json",
            stream: false,
          }),
        },
      );

      if (!ollamaResponse.ok) throw new Error("Ollama service not responding.");

      const ollamaData = await ollamaResponse.json();
      const parsedData = JSON.parse(ollamaData.response);

      return NextResponse.json({
        success: true,
        source: "Ollama (Qwen2.5-Coder:7b)",
        ac: parsedData.acceptanceCriteria,
        bdd: parsedData.bddScenarios,
        steps: parsedData.stepDefinitions, // Corrected to use the local data
      });
    }
  } catch (error) {
    console.error("Critical Failure:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "AI Systems Offline. Make sure Groq key is valid or Ollama is running 'qwen2.5-coder:7b'.",
      },
      { status: 500 },
    );
  }
}
