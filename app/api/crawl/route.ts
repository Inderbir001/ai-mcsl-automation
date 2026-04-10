import { NextResponse } from 'next/server';
import { crawlAndMap } from '@/lib/crawler'; // Note: Next.js uses @/ to refer to the root/src

export async function POST(req: Request) {
  try {
    const { url, name } = await req.json();
    
    if (!url || !name) {
      return NextResponse.json({ success: false, error: "Missing URL or Name" }, { status: 400 });
    }

    const result = await crawlAndMap(url, name);

    if (result.success) {
      return NextResponse.json({ success: true, message: `Mapped successfully to ${result.path}` });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}