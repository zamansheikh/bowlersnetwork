import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://test.bowlersnetwork.com';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid } = await params;
        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        console.log(`[Amateur] Forwarding GET request to upstream API (photo details): ${uid}`);

        const response = await fetch(`${BASE_URL}/api/photos/${uid}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { errors: [`Upstream server returned error ${response.status} on photo details`] };
            }
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('[Amateur] Photo details error (proxy):', error);
        return NextResponse.json(
            { errors: ['Failed to fetch photo details (network or server error)'] },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid } = await params;
        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        console.log(`[Amateur] Forwarding DELETE request to upstream API (photo): ${uid}`);

        const response = await fetch(`${BASE_URL}/api/photos/${uid}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { errors: [`Upstream server returned error ${response.status} on photo delete`] };
            }
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('[Amateur] Photo delete error (proxy):', error);
        return NextResponse.json(
            { errors: ['Failed to delete photo (network or server error)'] },
            { status: 500 }
        );
    }
}
