import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/utils/otp-store';

interface SendVerificationCodeRequest {
    email: string;
}

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

        // Generate OTP
        const otp = otpStore.generateOTP();

        // Store OTP
        otpStore.set(body.email, otp);

        // Log OTP (in development only - in production, send via email)
        console.log(`\n🔐 OTP for ${body.email}: ${otp}`);
        console.log(`   Expires in 5 minutes\n`);

        // TODO: Send OTP via email service
        // Example with Resend:
        // await resend.emails.send({
        //   from: 'BowlersNetwork <noreply@bowlersnetwork.com>',
        //   to: body.email,
        //   subject: 'Your Verification Code',
        //   html: `<p>Your verification code is: <strong>${otp}</strong></p>
        //          <p>This code will expire in 5 minutes.</p>`
        // });

        // Example with SendGrid:
        // await sgMail.send({
        //   to: body.email,
        //   from: 'noreply@bowlersnetwork.com',
        //   subject: 'Your Verification Code',
        //   text: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
        //   html: `<p>Your verification code is: <strong>${otp}</strong></p>
        //          <p>This code will expire in 5 minutes.</p>`
        // });

        return NextResponse.json(
            {
                message: 'Verification code sent successfully',
                // In development, return the OTP (REMOVE IN PRODUCTION!)
                ...(process.env.NODE_ENV === 'development' && { debug_otp: otp })
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
