import { NextRequest, NextResponse } from 'next/server';

interface SendVerificationCodeRequest {
    email: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.bowlersnetwork.com';

export async function POST(request: NextRequest) {
    try {
        const body: SendVerificationCodeRequest = await request.json();

        // Validate email
        if (!body.email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Call the actual backend API
        const response = await fetch(`${API_BASE_URL}/api/send-verification-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: body.email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: data.error || data.message || 'Failed to send verification code'
                },
                { status: response.status }
            );
        }

        // Log success (for debugging)
        console.log(`✅ Verification code sent to: ${body.email}`);

        return NextResponse.json(
            {
                message: data.message || 'Verification code sent successfully'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Send verification code error:', error);

        return NextResponse.json(
            {
                error: 'Failed to send verification code. Please try again later.',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
}
