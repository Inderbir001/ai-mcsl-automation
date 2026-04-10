import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

// Convert the old callback-based exec into a modern async/await Promise
const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    // 1. Receive the BDD script and card title from the frontend
    const { bdd, title } = await req.json();
    
    // 2. Format a safe file name (e.g., "Login Error Validation" -> "login-error-validation.feature")
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filePath = path.join(process.cwd(), 'tests', 'features', `${safeTitle}.feature`);

    // 3. Write the edited BDD text into the tests/features folder
    await fs.writeFile(filePath, bdd, 'utf-8');

    // 4. Trigger the Playwright/Cucumber test runner programmatically
    const { stdout, stderr } = await execPromise('npm run test:ai');

    // 5. Send the terminal logs back to the UI
    return NextResponse.json({ success: true, logs: stdout });
    
  } catch (error) {
    console.error("Execution failed:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}