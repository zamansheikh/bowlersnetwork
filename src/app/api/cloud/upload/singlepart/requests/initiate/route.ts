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

        console.log('[Amateur] Initiating singlepart upload proxy to upstream API');

        const response = await fetch(
            'https://test.bowlersnetwork.com/api/cloud/upload/singlepart/requests/initiate',
            {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            }
        );

        console.log('[Amateur] Upstream API respond status (initiate):', response.status);

        // Map status code to response
        if (response.status === 200 || response.status === 201) {
            const data = await response.json();
            return NextResponse.json(data, { status: 200 });
        } else if (response.status === 401 || response.status === 403) {
            const data = await response.json().catch(() => ({ errors: ['Unauthorized or forbidden on upstream server'] }));
            return NextResponse.json(data, { status: response.status });
        } else if (response.status === 400 || response.status === 409 || response.status === 422) {
            const data = await response.json().catch(() => ({ errors: ['Validation error on upstream server'] }));
            return NextResponse.json(data, { status: response.status });
        }

        // For other status codes, return a generic error or attempt to parse error data
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { errors: [`Upstream server returned error ${response.status}`] };
        }

        return NextResponse.json(errorData, { status: response.status >= 400 && response.status < 600 ? response.status : 500 });
    } catch (error) {
        console.error('[Amateur] Initiate upload error (proxy):', error);
        return NextResponse.json(
            { errors: ['Failed to initiate upload (network or server error)'] },
            { status: 500 }
        );
    }
}
