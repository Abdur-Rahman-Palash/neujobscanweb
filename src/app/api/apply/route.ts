import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Application received:', body)
    // In production: queue application, send email, etc.
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('apply error', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
