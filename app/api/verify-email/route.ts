import { NextRequest, NextResponse } from 'next/server';

interface VerifyEmailRequest {
    email: string;
    code: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.bowlersnetwork.com';

export async function POST(request: NextRequest) {
    try {
        const body: VerifyEmailRequest = await request.json();

        // Validate required fields
        if (!body.email || !body.code) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email and verification code are required'
                },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email format'
                },
                { status: 400 }
            );
        }

        // Call the actual backend API
        const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: body.email,
                code: body.code
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || data.error || 'Invalid verification code'
                },
                { status: response.status }
            );
        }

        console.log(`✅ Email verified successfully: ${body.email}`);

        return NextResponse.json(
            {
                success: data.success !== false,
                message: data.message || 'Email verified successfully'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Verify email error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to verify email. Please try again later.',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
}
