import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    // 1. Receive BDD, Step Definitions, and Title from the frontend
    const { bdd, steps, title } = await req.json();

    // 2. Format safe file names
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const featuresDir = path.join(process.cwd(), "tests", "features");
    const stepsDir = path.join(process.cwd(), "tests", "steps");

    // 3. Ensure directories exist
    await fs.mkdir(featuresDir, { recursive: true });
    await fs.mkdir(stepsDir, { recursive: true });

    const featureFilePath = path.join(featuresDir, `${safeTitle}.feature`);
    const stepsFilePath = path.join(stepsDir, `${safeTitle}.steps.ts`);

    // 4. Write both files to the disk
    console.log(`💾 Saving feature file: ${safeTitle}.feature`);
    await fs.writeFile(featureFilePath, bdd, "utf-8");

    console.log(`💾 Saving step definitions: ${safeTitle}.steps.ts`);
    await fs.writeFile(stepsFilePath, steps, "utf-8");

    // 5. Trigger the Playwright/Cucumber test runner
    console.log("🚀 Running Playwright Engine...");
    const { stdout } = await execPromise("npm run test:ai");

    // 6. Send the successful logs back
    return NextResponse.json({ success: true, logs: stdout });
  } catch (error: any) {
    // Crucial: Catch test failures and send back the actual Playwright output
    console.error("Execution failed!");
    const realLogs = error.stdout || error.message || String(error);

    return NextResponse.json(
      {
        success: false,
        error: realLogs,
      },
      { status: 500 },
    );
  }
}
