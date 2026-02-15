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

        console.log('[Amateur] Aborting singlepart upload proxy to upstream API');

        const response = await fetch(
            'https://test.bowlersnetwork.com/api/cloud/upload/singlepart/requests/abort',
            {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            }
        );

        console.log('[Amateur] Upstream API respond status (abort):', response.status);

        if (response.status === 200 || response.status === 204) {
            try {
                const data = response.status === 204 ? { message: 'Aborted' } : await response.json();
                return NextResponse.json(data, { status: 200 });
            } catch (e) {
                return NextResponse.json({ message: 'Aborted' }, { status: 200 });
            }
        }

        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { errors: [`Upstream server returned error ${response.status} on abort`] };
        }

        return NextResponse.json(errorData, { status: response.status >= 400 && response.status < 600 ? response.status : 500 });
    } catch (error) {
        console.error('[Amateur] Abort upload error (proxy):', error);
        return NextResponse.json(
            { errors: ['Failed to abort upload (network or server error)'] },
            { status: 500 }
        );
    }
}
