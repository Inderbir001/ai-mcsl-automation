import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    // 1. Read the App Memory (YAML file)
    let uiContext = "No specific UI context provided.";
    try {
      const yamlPath = path.join(
        process.cwd(),
        "knowledge-bank",
        "target-app.yaml",
      );
      uiContext = await fs.readFile(yamlPath, "utf-8");
    } catch (e) {
      console.log("No YAML context found, proceeding without it.");
    }

    // 2. The Master Prompt
    const prompt = `You are a Senior QA Automation Engineer. Your job is to take a user requirement and write Acceptance Criteria and BDD test scenarios.

    REQUIREMENT TITLE: ${title}
    REQUIREMENT DESCRIPTION: ${description}

    APP UI KNOWLEDGE (YAML Accessibility Tree):
    ${uiContext}

    INSTRUCTIONS:
    1. Read the Requirement and the UI Knowledge.
    2. Write clear, numbered Acceptance Criteria.
    3. Write valid Gherkin (BDD) test cases using Given/When/Then syntax. 
    4. Make sure your Gherkin steps reference the exact locators, buttons, and text fields found in the App UI Knowledge.

    Respond STRICTLY with a JSON object in this format:
    {
      "acceptanceCriteria": "1. ...\\n2. ...",
      "bddScenarios": "Feature: ...\\n  Scenario: ...\\n    Given ...\\n    When ...\\n    Then ..."
    }`;

    // ==========================================
    // PLAN A: GOOGLE GEMINI (The Cloud Brain)
    // ==========================================
    try {
      console.log("☁️ Attempting Gemini AI...");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash", // We'll try the 2.0 model first
        generationConfig: { responseMimeType: "application/json" },
      });

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());

      return NextResponse.json({
        success: true,
        source: "Gemini",
        ac: data.acceptanceCriteria,
        bdd: data.bddScenarios,
      });
    } catch (geminiError) {
      console.log(
        "⚠️ Gemini failed or rate-limited. Triggering Ollama Fallback...",
        String(geminiError).substring(0, 100),
      );

      // ==========================================
      // PLAN B: LOCAL OLLAMA (The Safety Net)
      // ==========================================
      const ollamaResponse = await fetch(
        "http://localhost:11434/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2", // Ensure this matches the model you downloaded
            prompt: prompt,
            format: "json", // Forces Ollama to return valid JSON
            stream: false,
          }),
        },
      );

      if (!ollamaResponse.ok) {
        throw new Error(
          "Both Gemini AND Ollama failed. Check if Ollama is running!",
        );
      }

      const ollamaData = await ollamaResponse.json();
      const parsedData = JSON.parse(ollamaData.response);

      return NextResponse.json({
        success: true,
        source: "Ollama (Local Fallback)",
        ac: parsedData.acceptanceCriteria,
        bdd: parsedData.bddScenarios,
      });
    }
  } catch (error) {
    console.error("Total AI Failure:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
