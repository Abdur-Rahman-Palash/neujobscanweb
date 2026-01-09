'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const plan = searchParams?.get('plan');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, plan })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('sent');
        setName(''); setEmail(''); setMessage('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Contact Sales{plan ? ` — ${plan}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">Send message</Button>
              </div>

              {status === 'sending' && <div className="text-sm text-gray-600">Sending...</div>}
              {status === 'sent' && <div className="text-sm text-green-600">Message sent — we'll reach out shortly.</div>}
              {status === 'error' && <div className="text-sm text-red-600">Error sending message. Please try again later.</div>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
