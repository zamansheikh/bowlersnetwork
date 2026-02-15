'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

export default function SignUpPage() {
    const [currentStep, setCurrentStep] = useState(1);

    // Form Data
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Verification
    const [verificationCode, setVerificationCode] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { signup } = useAuth();
    const router = useRouter();

    const validateForm = async (): Promise<boolean> => {
        if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        try {
            setIsLoading(true);
            const validationData = {
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                password: password
            };

            const result = await authApi.validateSignupData(validationData);

            if (result.is_valid) {
                setError('');
                setValidationErrors([]);
                return true;
            } else {
                setValidationErrors(result.errors || []);
                setError(result.errors ? 'Please fix the errors below.' : 'Validation failed');
                return false;
            }
        } catch (error: any) {
            console.error('Validation error:', error);
            const message = error.response?.data?.errors?.[0] || 'An error occurred while validating your information.';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const sendVerificationCode = async () => {
        setIsSendingCode(true);
        setError('');

        try {
            await authApi.sendVerificationCode(email);
            setCodeSent(true);
            setCurrentStep(2);
        } catch (error: any) {
            console.error('Error sending code:', error);
            setError(error.response?.data?.detail || 'Failed to send verification code. Please try again.');
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleSignup = async () => {
        setError('');
        setIsLoading(true);

        try {
            const signupData = {
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                password: password
            };

            const success = await signup({
                signup_data: signupData,
                verification_code: verificationCode || null
            });

            if (success) {
                router.push('/');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            // Check if it's an invalid code error (401)
            if (err.response?.status === 401) {
                setError('Invalid verification code. Please try again.');
            } else {
                setError(err.response?.data?.errors?.[0] || 'An error occurred during account creation.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (isValid) {
            await sendVerificationCode();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Image
                            src="/logo/logo.png"
                            alt="Amateur Player Logo"
                            width={48}
                            height={48}
                            unoptimized
                            className="rounded-lg"
                        />
                        <span className="text-2xl font-bold text-gray-900">Bowlers Network</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">Step {currentStep} of 2</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 2) * 100}%` }}
                    ></div>
                </div>

                {currentStep === 1 && (
                    <form className="mt-8 space-y-6" onSubmit={handleNext}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                                {validationErrors.length > 0 && (
                                    <ul className="list-disc pl-5 mt-2">
                                        {validationErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 text-center">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Choose a username"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter your email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Min 8 chars"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading || isSendingCode}
                                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                style={{
                                    backgroundColor: (isLoading || isSendingCode) ? '#d1d5db' : '#8BC342',
                                }}
                            >
                                {isLoading || isSendingCode ? 'Processing...' : 'Next'}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link href="/signin" className="font-medium text-green-600 hover:text-green-500">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </form>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 mt-8">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <h3 className="text-lg font-medium text-gray-900 text-center">Verify Your Email</h3>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-center">
                                <p className="text-sm text-blue-800 mb-2">
                                    We sent a verification code to:
                                </p>
                                <p className="font-medium text-blue-900 mb-4">{email}</p>

                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Enter the 6-digit verification code sent to your email:
                                    </p>
                                    <div className="flex flex-col items-center space-y-4">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-64 px-4 py-3 text-center text-sm font-mono border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 tracking-widest"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSignup}
                                            disabled={isLoading || verificationCode.length !== 6}
                                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                        >
                                            {isLoading ? 'Creating Account...' : 'Create Account'}
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCodeSent(false);
                                                setVerificationCode('');
                                                setError('');
                                                sendVerificationCode();
                                            }}
                                            disabled={isSendingCode}
                                            className="text-sm text-green-600 hover:text-green-700 underline"
                                        >
                                            {isSendingCode ? 'Sending...' : "Didn't receive the code? Resend"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentStep(1);
                                    setError('');
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                By creating an account, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}