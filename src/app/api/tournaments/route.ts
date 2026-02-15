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
        const response = await fetch('https://test.bowlersnetwork.com/api/tournaments', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validate required fields
        if (!body.name || !body.start_date || !body.reg_deadline || !body.reg_fee) {
            return NextResponse.json(
                { error: 'Name, start date, registration deadline, and fee are required' },
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
        const response = await fetch('https://test.bowlersnetwork.com/api/tournaments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                name: body.name,
                start_date: body.start_date,
                reg_deadline: body.reg_deadline,
                reg_fee: body.reg_fee,
                participants_count: body.participants_count,
                address: body.address,
                access_type: body.access_type || 'Open'
            }),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error creating tournament:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
