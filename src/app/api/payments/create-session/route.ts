export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';

// Mock payments API route that returns a checkout URL for the requested plan.
// In production you would integrate with Stripe/PayPal/Checkout/Crypto providers.

export async function POST(request: NextRequest) {
  try {
    const { plan, email } = await request.json();

    // Validate minimal input
    if (!plan || !email) {
      return NextResponse.json({ success: false, error: 'Missing plan or email' }, { status: 400 });
    }

    // Build a mock checkout URL. Replace this with provider SDK call in production.
    const checkoutUrl = `https://checkout.example.com/mock?plan=${encodeURIComponent(plan)}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({ success: true, checkoutUrl }, { status: 200 });
  } catch (error) {
    console.error('create-session error', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}