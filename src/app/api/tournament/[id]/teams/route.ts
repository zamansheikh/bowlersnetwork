import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            );
        }

        // Forward the request to the external API
        const response = await fetch(`https://test.bowlersnetwork.com/api/tournament/${id}/teams`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch tournament teams: ${errorData}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in tournament teams API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
