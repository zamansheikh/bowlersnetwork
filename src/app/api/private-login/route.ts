import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/private-login
 * 
 * Private access login endpoint for beta launch
 * 
 * Request body:
 * {
 *   "private_key": "your_private_key_here"
 * }
 * 
 * Response on success:
 * {
 *   "access_token": "eyJhbGc..."
 * }
 * 
 * Response on error:
 * {
 *   "error": "Invalid or expired private key"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { private_key } = body;

        console.log('Private login API - received key:', private_key);

        if (!private_key) {
            return NextResponse.json(
                { error: 'private_key is required' },
                { status: 400 }
            );
        }

        // Forward the request to the backend API
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://test.bowlersnetwork.com';
        console.log('Forwarding to backend:', `${backendUrl}/api/private-login`);

        const response = await fetch(`${backendUrl}/api/private-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                private_key: private_key
            })
        });

        console.log('Backend response status:', response.status);

        const data = await response.json();
        console.log('Backend response data:', data);

        if (!response.ok) {
            console.error('Backend error:', data);
            return NextResponse.json(
                { error: data.error || 'Authentication failed' },
                { status: response.status }
            );
        }

        // Return the access token
        // Backend returns 'access_key', we normalize it to 'access_token'
        return NextResponse.json(
            {
                access_token: data.access_key || data.access_token
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Private login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
