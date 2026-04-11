"use client";

import { useState } from "react";
import { mockTrelloQueue } from "../lib/mockData";
import { TrelloCard } from "../types";

export default function Dashboard() {
  const [selectedCard, setSelectedCard] = useState<TrelloCard | null>(null);

  // States for AI Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAC, setGeneratedAC] = useState("");
  const [generatedBDD, setGeneratedBDD] = useState("");
  const [generatedSteps, setGeneratedSteps] = useState(""); // New state for Playwright code

  // States for Playwright Execution
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState("");

  // States for the Crawler
  const [crawlUrl, setCrawlUrl] = useState("https://example.com");
  const [isCrawling, setIsCrawling] = useState(false);

  // Function to handle clicking a new card
  const handleCardSelect = (card: TrelloCard) => {
    setSelectedCard(card);
    setGeneratedAC("");
    setGeneratedBDD("");
    setGeneratedSteps("");
    setExecutionLogs("");
  };

  // The Real AI Generator with Ollama Fallback
  const handleGenerateAI = async () => {
    if (!selectedCard) return;

    setIsGenerating(true);
    setExecutionLogs("Sending requirement and UI context to AI...\n");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedCard.title,
          description: selectedCard.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedAC(data.ac);
        setGeneratedBDD(data.bdd);
        setGeneratedSteps(data.steps); // Store the generated TypeScript code
        setExecutionLogs(
          (prev) =>
            prev + `AI Generation Complete! ✅ (Powered by ${data.source})\n`,
        );
      } else {
        setExecutionLogs(
          (prev) => prev + "AI Generation Failed! ❌\n" + data.error,
        );
      }
    } catch (error) {
      setExecutionLogs((prev) => prev + "Network error connecting to AI.\n");
    } finally {
      setIsGenerating(false);
    }
  };

  // The Playwright Execution Trigger
  const handleExecuteTests = async () => {
    if (!selectedCard || !generatedBDD || !generatedSteps) {
      setExecutionLogs(
        (prev) => prev + "Error: Missing BDD or Step Definitions to execute.\n",
      );
      return;
    }

    setIsExecuting(true);
    setExecutionLogs("Initializing Playwright Engine...\n");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedCard.title,
          bdd: generatedBDD,
          steps: generatedSteps, // Passing the actual Playwright code to the API
        }),
      });

      const data = await response.json();

      if (data.success) {
        setExecutionLogs(
          (prev) => prev + "\nExecution Complete! ✅\n\nLogs:\n" + data.logs,
        );
      } else {
        setExecutionLogs(
          (prev) => prev + "\nExecution Failed! ❌\n\nError:\n" + data.error,
        );
      }
    } catch (error) {
      setExecutionLogs((prev) => prev + "\nNetwork Error occurred.");
    } finally {
      setIsExecuting(false);
    }
  };

  // The Crawler Execution Trigger
  const handleCrawlApp = async () => {
    setIsCrawling(true);
    setExecutionLogs(`Crawling ${crawlUrl}...\n`);

    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: crawlUrl, name: "Target App" }),
      });

      const data = await response.json();

      if (data.success) {
        setExecutionLogs(
          (prev) => prev + `\nCrawl Complete! ✅\nKnowledge Bank updated.`,
        );
      } else {
        setExecutionLogs((prev) => prev + `\nCrawl Failed! ❌\n` + data.error);
      }
    } catch (error) {
      setExecutionLogs(
        (prev) => prev + "\nNetwork Error occurred during crawl.",
      );
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-4">
        <h1 className="text-xl font-bold mb-8">AI QA Control</h1>
        <nav className="flex flex-col gap-2">
          <button className="text-left px-4 py-2 bg-slate-800 rounded text-blue-400 font-medium">
            Trello Queue
          </button>
          <button className="text-left px-4 py-2 rounded hover:bg-slate-700 transition-colors">
            App Knowledge Bank
          </button>
          <button className="text-left px-4 py-2 rounded hover:bg-slate-700 transition-colors">
            Regression Reports
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Trello Ingestion Queue
          </h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Fetch Latest Cards
          </button>
        </header>

        {/* App Knowledge Scanner */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-700 mb-1">
              Update App Knowledge Bank
            </h3>
            <p className="text-xs text-gray-500">
              Extracts the accessibility tree for AI context.
            </p>
          </div>
          <input
            type="text"
            value={crawlUrl}
            onChange={(e) => setCrawlUrl(e.target.value)}
            className="border border-gray-300 p-2 rounded w-64 text-sm text-black"
            placeholder="https://your-app.com"
          />
          <button
            onClick={handleCrawlApp}
            disabled={isCrawling}
            className={`px-4 py-2 rounded text-white font-medium whitespace-nowrap transition-colors ${isCrawling ? "bg-slate-400 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-700"}`}
          >
            {isCrawling ? "Scanning..." : "Scan URL 🔍"}
          </button>
        </div>

        {/* The Mock Queue List */}
        <div className="mb-8 flex gap-4 overflow-x-auto pb-4">
          {mockTrelloQueue.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardSelect(card)}
              className={`min-w-[250px] p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCard?.id === card.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {card.id}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                    card.status === "Ready for Execution"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {card.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 truncate">
                {card.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Requirement Box */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Current Requirement
            </h3>
            {selectedCard ? (
              <div className="p-4 bg-gray-50 rounded border border-gray-200 text-gray-700">
                <h4 className="font-bold mb-2">{selectedCard.title}</h4>
                <p className="text-sm leading-relaxed">
                  {selectedCard.description}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500 flex items-center justify-center h-48">
                Select a Trello card from the queue above
              </div>
            )}
          </div>

          {/* Card 2: AI Generation Workspace */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
            <h3 className="text-lg font-semibold text-black mb-4">
              AI Generated Tests
            </h3>

            {selectedCard ? (
              <div className="flex-1 flex flex-col gap-4">
                {/* Generate Button / Loading State */}
                {!generatedAC && !isGenerating && (
                  <button
                    onClick={handleGenerateAI}
                    className="bg-black text-white px-4 py-3 rounded-md hover:bg-gray-900 transition-colors font-semibold w-full flex justify-center items-center gap-2"
                  >
                    ✨ Generate AC & Test Cases with AI
                  </button>
                )}

                {isGenerating && (
                  <div className="flex items-center justify-center p-8 bg-purple-50 border border-purple-200 rounded text-purple-700 font-medium animate-pulse">
                    Thinking... (Parsing requirements & checking app structure)
                  </div>
                )}

                {/* Editable Results Area */}
                {generatedAC && !isGenerating && (
                  <div className="flex flex-col gap-4 flex-1">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">
                        Acceptance Criteria
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded text-sm bg-gray-50 text-black focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        rows={4}
                        value={generatedAC}
                        onChange={(e) => setGeneratedAC(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">
                        BDD Scenarios (Gherkin)
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded text-sm bg-gray-50 text-black focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono"
                        rows={6}
                        value={generatedBDD}
                        onChange={(e) => setGeneratedBDD(e.target.value)}
                      />
                    </div>

                    {/* Step Definitions Confirmation (Visual Cue) */}
                    {generatedSteps && (
                      <div className="text-[10px] text-green-600 font-mono bg-green-50 p-2 border border-green-200 rounded">
                        Step Definitions generated & cached for execution.
                      </div>
                    )}

                    {/* Execution Controls */}
                    <div className="mt-auto pt-4 border-t flex flex-col gap-3">
                      <div className="flex justify-end gap-3">
                        <button
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                          onClick={() => {
                            setGeneratedAC("");
                            setGeneratedBDD("");
                            setGeneratedSteps("");
                            setExecutionLogs("");
                          }}
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleExecuteTests}
                          disabled={isExecuting}
                          className={`px-6 py-2 text-white rounded font-medium transition-colors ${
                            isExecuting
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {isExecuting
                            ? "Running Playwright..."
                            : "Approve & Execute Playwright Tests 🚀"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 p-4 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500 flex items-center justify-center">
                Waiting for requirement input...
              </div>
            )}

            {/* Live Execution Logs */}
            {executionLogs && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-black mb-1">
                  Terminal Output
                </label>
                <pre className="w-full bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
                  {executionLogs}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
