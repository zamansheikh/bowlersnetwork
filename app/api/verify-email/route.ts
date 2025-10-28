import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/utils/otp-store';

interface VerifyEmailRequest {
    email: string;
    code: string;
}export async function POST(request: NextRequest) {
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

        // Get stored OTP data
        const storedData = otpStore.get(body.email);

        // Check if OTP exists or is expired
        if (!storedData) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Verification code not found or expired. Please request a new code.'
                },
                { status: 400 }
            );
        }

        // Verify OTP
        if (!otpStore.isValid(body.email, body.code)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid verification code. Please try again.'
                },
                { status: 400 }
            );
        }

        // OTP verified successfully - remove from store
        otpStore.delete(body.email); console.log(`✅ Email verified successfully: ${body.email}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Email verified successfully'
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
