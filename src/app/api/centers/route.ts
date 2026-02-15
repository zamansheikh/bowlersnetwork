import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for /api/centers -> forwards to external API
 * Uses NEXT_PUBLIC_API_URL if available, otherwise falls back to https://test.bowlersnetwork.com
 */
export async function GET(request: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://test.bowlersnetwork.com';
    let url = `${base}/api/centers`;
    // Forward query string if present (e.g. ?q=term)
    if (request.url.includes('?')) {
      const queryString = request.url.split('?')[1];
      if (queryString) url += `?${queryString}`;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward auth header if present
    const auth = request.headers.get('authorization');
    if (auth) headers['authorization'] = auth;

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Proxy /api/centers error:', error);
    return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://test.bowlersnetwork.com';
    const url = `${base}/api/centers`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward auth header
    const auth = request.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;

    const body = await request.json();

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Proxy POST /api/centers error:', error);
    return NextResponse.json({ error: 'Failed to create center' }, { status: 500 });
  }
}
