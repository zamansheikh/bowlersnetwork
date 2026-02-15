import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validate required fields
        if (!body.feedback_type_id || !body.title || !body.details) {
            return NextResponse.json(
                { error: 'Feedback type, title, and details are required' },
                { status: 400 }
            );
        }

        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            );
        }

        // Forward to external API
        const response = await fetch('https://test.bowlersnetwork.com/api/feedbacks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                feedback_type_id: body.feedback_type_id,
                title: body.title,
                details: body.details
            }),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error processing feedback:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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
        const response = await fetch('https://test.bowlersnetwork.com/api/feedbacks', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
