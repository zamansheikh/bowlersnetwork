import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            );
        }

        // Forward to external API
        const response = await fetch(`https://test.bowlersnetwork.com/api/tournaments/${id}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error registering for tournament:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            );
        }

        // Forward to external API
        const response = await fetch(`https://test.bowlersnetwork.com/api/tournaments/${id}/register`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error unregistering from tournament:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
