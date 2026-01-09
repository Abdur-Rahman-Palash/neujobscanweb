// Payments provider scaffolding to support multiple payment methods (Stripe, PayPal, Crypto)
// This is a pluggable abstraction returning normalized checkout sessions.

export type CheckoutSession = {
  id: string;
  url: string;
  provider: string; // 'stripe' | 'paypal' | 'crypto' | 'mock'
};

export async function createCheckoutSession(plan: string, email: string, currency: string = 'USD'): Promise<CheckoutSession> {
  // TODO: implement provider integration: Stripe, PayPal, Crypto gateway
  // For now return a mock session that the API route uses.
  return {
    id: `mock_${Date.now()}`,
    url: `https://checkout.example.com/mock?plan=${encodeURIComponent(plan)}&email=${encodeURIComponent(email)}&currency=${currency}`,
    provider: 'mock'
  };
}
