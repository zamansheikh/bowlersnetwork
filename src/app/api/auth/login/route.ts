import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // For demo purposes, accept any credentials
        // In a real app, you would validate against a database
        if (username && password) {
            // Simulate successful login
            const mockResponse = {
                access_token: 'demo_token_' + Date.now(),
                user: {
                    id: 1,
                    username: username,
                    email: username.includes('@') ? username : `${username}@example.com`,
                    name: 'Demo User',
                    authenticated: true
                }
            };

            return NextResponse.json(mockResponse, { status: 200 });
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
