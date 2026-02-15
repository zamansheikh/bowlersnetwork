import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            );
        }

        // Forward to external API
        const response = await fetch('https://test.bowlersnetwork.com/api/feedback-types', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching feedback types:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
