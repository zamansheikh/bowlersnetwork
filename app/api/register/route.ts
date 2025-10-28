import { NextRequest, NextResponse } from 'next/server';

// Type for the registration data
interface RegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    timestamp?: string;
}

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

        // Add timestamp
        const registrationData: RegistrationData = {
            ...body,
            timestamp: new Date().toISOString()
        };

        // Log the registration (in production, you'd save this to a database)
        console.log('New registration:', registrationData);

        // TODO: Save to database
        // Example:
        // await prisma.registration.create({
        //   data: registrationData
        // });

        // TODO: Send confirmation email
        // Example:
        // await sendEmail({
        //   to: body.email,
        //   subject: 'Welcome to BowlersNetwork!',
        //   html: generateWelcomeEmail(body.firstName)
        // });

        // TODO: Add to mailing list (e.g., Mailchimp, SendGrid)
        // Example:
        // await addToMailingList(body.email, body.firstName, body.lastName);

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Registration successful! We will be in touch soon.',
                data: {
                    firstName: body.firstName,
                    email: body.email
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);

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
