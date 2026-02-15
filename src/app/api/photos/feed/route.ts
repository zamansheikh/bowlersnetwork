import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://test.bowlersnetwork.com';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        console.log('[Amateur] Forwarding GET request to upstream API (photos feed)');

        const response = await fetch(`${BASE_URL}/api/photos/feed`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { errors: [`Upstream server returned error ${response.status} on photos feed`] };
            }
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('[Amateur] Photo feed error (proxy):', error);
        return NextResponse.json(
            { errors: ['Failed to fetch photos feed (network or server error)'] },
            { status: 500 }
        );
    }
}
