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

  // States for Playwright Execution
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState("");

  // Function to handle clicking a new card
  const handleCardSelect = (card: TrelloCard) => {
    setSelectedCard(card);
    // Clear out old AI and execution data when switching cards
    setGeneratedAC("");
    setGeneratedBDD("");
    setExecutionLogs("");
  };

  // The Mock AI Generator
  const handleGenerateAI = () => {
    setIsGenerating(true);
    setExecutionLogs(""); // Clear previous logs

    // Simulate a 2.5-second delay from OpenAI
    setTimeout(() => {
      setGeneratedAC(
        "1. Verify input field exists for target data.\n2. Verify system detects invalid format on blur or submit.\n3. Verify UI displays exact error text provided in requirements.\n4. Verify form submission is blocked if format is invalid.",
      );
      setGeneratedBDD(
        "Feature: Requirement Validation\n\n  Scenario: Primary Negative Path\n    Given the user is on the target page\n    When the user enters invalid data format\n    Then the system should display an inline error message\n    And the submit button should remain disabled",
      );
      setIsGenerating(false);
    }, 2500);
  };

  // The Playwright Execution Trigger
  const handleExecuteTests = async () => {
    if (!selectedCard || !generatedBDD) return;

    setIsExecuting(true);
    setExecutionLogs("Initializing Playwright Engine...\n");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedCard.title,
          bdd: generatedBDD,
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              AI Generated Tests
            </h3>

            {selectedCard ? (
              <div className="flex-1 flex flex-col gap-4">
                {/* Generate Button / Loading State */}
                {!generatedAC && !isGenerating && (
                  <button
                    onClick={handleGenerateAI}
                    className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors font-semibold w-full flex justify-center items-center gap-2"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Acceptance Criteria
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        rows={5}
                        value={generatedAC}
                        onChange={(e) => setGeneratedAC(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        BDD Scenarios (Gherkin)
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono"
                        rows={7}
                        value={generatedBDD}
                        onChange={(e) => setGeneratedBDD(e.target.value)}
                      />
                    </div>

                    {/* Execution Controls */}
                    <div className="mt-auto pt-4 border-t flex flex-col gap-3">
                      <div className="flex justify-end gap-3">
                        <button
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                          onClick={() => {
                            setGeneratedAC("");
                            setGeneratedBDD("");
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

                      {/* Live Execution Logs */}
                      {executionLogs && (
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Terminal Output
                          </label>
                          <pre className="w-full bg-slate-900 text-green-400 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
                            {executionLogs}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 p-4 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500 flex items-center justify-center">
                Waiting for requirement input...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
