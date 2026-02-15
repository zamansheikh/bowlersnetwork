import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Pass the authorization token if it exists
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        console.log('[Amateur] Forwarding metadata POST request to upstream API (large-videos)');

        const response = await fetch(
            'https://test.bowlersnetwork.com/api/tube/large-videos',
            {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            }
        );

        console.log('[Amateur] Upstream API response status (save metadata):', response.status);

        if (response.status === 200 || response.status === 201) {
            const data = await response.json();
            return NextResponse.json(data, { status: 200 });
        }

        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { errors: [`Upstream server returned error ${response.status} on metadata save`] };
        }

        return NextResponse.json(errorData, { status: response.status >= 400 && response.status < 600 ? response.status : 500 });
    } catch (error) {
        console.error('[Amateur] Save video metadata error (proxy):', error);
        return NextResponse.json(
            { errors: ['Failed to save video metadata (network or server error)'] },
            { status: 500 }
        );
    }
}
