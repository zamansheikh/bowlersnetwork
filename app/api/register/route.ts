import { NextRequest, NextResponse } from 'next/server';

// Type for the registration data
interface RegistrationData {
    firstName: string;
    lastName: string;
    email: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.bowlersnetwork.com';

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body: RegistrationData = await request.json();

        // Validate required fields
        if (!body.firstName || !body.lastName || !body.email) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Call the backend API with correct payload format
        const payload = {
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            is_activated: true
        };

        console.log('📤 Sending registration to backend:', payload);

        const response = await fetch(`${API_BASE_URL}/api/pre-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Backend registration failed:', data);
            return NextResponse.json(
                {
                    error: data.message || 'Registration failed',
                    details: data
                },
                { status: response.status }
            );
        }

        console.log('✅ Registration successful:', data);

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Registration successful! We will be in touch soon.',
                data: data
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('❌ Registration error:', error);

        return NextResponse.json(
            {
                error: 'An error occurred during registration. Please try again later.',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
}

// Handle GET requests (optional - for testing)
export async function GET() {
    return NextResponse.json(
        {
            message: 'Registration API is working. Please use POST method to register.',
            endpoint: '/api/register',
            method: 'POST',
            requiredFields: ['firstName', 'lastName', 'email']
        },
        { status: 200 }
    );
}
