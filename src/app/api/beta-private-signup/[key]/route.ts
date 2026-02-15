import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ key: string }> }
) {
    try {
        const { key: privateKey } = await context.params;
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://test.bowlersnetwork.com';
        
        const response = await fetch(`${backendUrl}/api/beta-private-signup/${privateKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Authentication failed' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Private signup API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
