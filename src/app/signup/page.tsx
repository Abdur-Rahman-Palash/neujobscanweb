'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [next, setNext] = useState<string | undefined>(undefined);
  const [plan, setPlan] = useState<string | undefined>(undefined);
  const [trial, setTrial] = useState<boolean>(false);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    setNext(params?.get('next') || undefined);
    setPlan(params?.get('plan') || undefined);
    setTrial(params?.get('trial') === '1');
  }, []);
  const { signup, demoSignin } = useAuth();

  useEffect(() => {
    setError('');
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password (demo only).');
      return;
    }

    // If selected plan is Professional with trial, redirect to payment flow (mocked)
    if (plan === 'Professional' && trial) {
      // create checkout session then redirect (mock implementation)
      try {
        const res = await fetch('/api/payments/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'Professional', email })
        });
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
      } catch (err) {
        console.error('Payment session error', err);
        // Fallback: if API isn't available (static host), redirect to a mock checkout URL so user sees payment flow
        const fallbackUrl = `https://checkout.example.com/mock?plan=Professional&email=${encodeURIComponent(email)}`;
        window.location.href = fallbackUrl;
        return;
      }
    }

    // For free plan or others, complete demo signup and store plan on user
    await signup(email, password, next || undefined, plan || 'Free');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create a Demo Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">Selected plan:</span>
                    <div className="text-lg font-semibold">{plan || 'Free'}</div>
                    {trial && plan === 'Professional' && (
                      <div className="text-xs text-green-600">Free trial selected — billing setup required after trial</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">{plan === 'Professional' && trial ? 'Start' : 'Sign up'}</Button>
                    <Button type="button" variant="outline" onClick={() => demoSignin(next || undefined, plan)}>{plan ? `Use Demo (${plan})` : 'Use Demo'}</Button>
                  </div>
                </div>

                {plan === 'Professional' && trial && (
                  <div className="text-sm text-gray-600">By clicking <strong>Start</strong> we will begin a trial session — a payment page (mock) will be opened. You can still use <strong>Use Demo</strong> to preview without starting a trial.</div>
                )}

                <p className="text-xs text-gray-500">Note: This is a demo sign-up to preview features. When you go live, users will need a real email and a strong password.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}