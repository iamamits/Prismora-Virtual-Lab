import { NextRequest, NextResponse } from 'next/server';
import { BugReportStore } from '@/lib/bug-reporting/store';
import type { BugReportInput } from '@/lib/bug-reporting/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const body = (await req.json()) as BugReportInput;

    const result = await BugReportStore.submitReport(body, ip);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, message: 'Server error processing bug report', error: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const reports = await BugReportStore.getReports();
    return NextResponse.json({ success: true, count: reports.length, reports }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
