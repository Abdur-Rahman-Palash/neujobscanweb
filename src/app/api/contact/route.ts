import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Contact submission:', body);
    // In production, you would send an email (SES/SendGrid) or create a ticket in CRM
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('contact error', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
