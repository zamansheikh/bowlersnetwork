import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, username, email, password } = body;

        // For demo purposes, accept any valid data
        // In a real app, you would save to a database
        if (name && username && email && password) {
            // Simulate successful signup
            const mockResponse = {
                message: 'Account created successfully',
                user: {
                    id: 1,
                    name: name,
                    username: username,
                    email: email,
                    authenticated: true
                }
            };

            return NextResponse.json(mockResponse, { status: 201 });
        }

        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Signup API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
