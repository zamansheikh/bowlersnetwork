'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

type ForgotPasswordStep = 'email' | 'otp' | 'password' | 'success';

export default function SignInPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { signin } = useAuth();
    const router = useRouter();

    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotToken, setForgotToken] = useState(''); // New state for reset token
    const [forgotMethod, setForgotMethod] = useState<'otp' | 'magic'>('otp');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('Attempting to sign in...');
            const result = await signin(username, password);
            console.log('Sign in result:', result);
            if (result.success) {
                console.log('Sign in successful');
                if (result.profileComplete === false) {
                    console.log('Profile incomplete, redirecting to complete-profile');
                    router.push('/complete-profile');
                } else {
                    console.log('Profile complete, redirecting to home');
                    router.push('/');
                }
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Forgot password handlers
    const handleInitiateRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotError('');

        if (!forgotEmail) {
            setForgotError('Please enter your email address');
            return;
        }

        setForgotLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://test.bowlersnetwork.com';
            const endpoint = forgotMethod === 'otp'
                ? '/api/access/recovery/initiate/otp'
                : '/api/access/recovery/initiate/magic';

            const response = await axios.post(`${apiUrl}${endpoint}`, {
                email: forgotEmail
            });

            if (response.status === 200) {
                if (forgotMethod === 'otp') {
                    setForgotStep('otp');
                } else {
                    // For magic link, show success directly as it's an email link
                    setForgotStep('success');
                }
                setForgotError('');
            }
        } catch (err: any) {
            console.error('Recovery initiation failed:', err);
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to initiate recovery. Please try again.';
            setForgotError(errorMessage);
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyOTPAndPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotError('');

        if (!otp) {
            setForgotError('Please enter the OTP');
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            setForgotError('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setForgotError('Passwords do not match');
            return;
        }

        setForgotLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://test.bowlersnetwork.com';

            // Step 1: Validate OTP and get reset token
            const validateResponse = await axios.post(`${apiUrl}/api/access/recovery/validate/otp`, {
                email: forgotEmail,
                otp: otp
            });

            if (validateResponse.status === 200 && validateResponse.data.access_token) {
                const resetToken = validateResponse.data.access_token;

                // Step 2: Use the token to reset the password
                const resetResponse = await axios.post(
                    `${apiUrl}/api/access/recovery/reset/password`,
                    { password: newPassword },
                    {
                        headers: {
                            Authorization: `Bearer ${resetToken}`
                        }
                    }
                );

                if (resetResponse.status === 200) {
                    setForgotStep('success');
                    setForgotError('');
                }
            }
        } catch (err: any) {
            console.error('Reset password process failed:', err);
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to reset password. Please try again.';
            setForgotError(errorMessage);
        } finally {
            setForgotLoading(false);
        }
    };

    const closeForgotPasswordModal = () => {
        setShowForgotPassword(false);
        setForgotStep('email');
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotError('');
        setForgotToken('');
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
                    <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link href="/signup" className="font-medium text-green-600 hover:text-green-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
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
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 border-gray-300 rounded focus:ring-green-500" style={{ accentColor: '#8BC342' }} />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm hover:underline"
                            style={{ color: '#8BC342' }}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{
                                backgroundColor: isLoading ? '#d1d5db' : '#8BC342',
                            }}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.backgroundColor = '#7aa838';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.backgroundColor = '#8BC342';
                                }
                            }}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="font-medium text-green-600 hover:text-green-500">
                                Sign up here
                            </Link>
                        </p>
                    </div>

                </form>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-green-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-sm text-gray-500 mb-6">Choose how you want to recover your account</p>

                        {forgotStep === 'email' && (
                            <form onSubmit={handleInitiateRecovery} className="space-y-4">
                                {/* Method Selection Tabs */}
                                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setForgotMethod('otp')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${forgotMethod === 'otp' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        OTP Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForgotMethod('magic')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${forgotMethod === 'magic' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Magic Link
                                    </button>
                                </div>

                                {forgotError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                        {forgotError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <p className="text-sm text-gray-600">
                                    {forgotMethod === 'otp'
                                        ? "We'll send you a 6-digit OTP code to verify your identity."
                                        : "We'll send you a secure link to your email to reset your password."}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeForgotPasswordModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                        style={{ background: '#8BC342' }}
                                    >
                                        {forgotLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {forgotLoading ? 'Sending...' : (forgotMethod === 'otp' ? 'Send OTP' : 'Send Link')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {forgotStep === 'otp' && (
                            <form onSubmit={handleVerifyOTPAndPassword} className="space-y-4">
                                {forgotError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                        {forgotError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                    <p className="text-xs text-gray-600 mt-1">Check your email for the 6-digit code</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">Minimum 8 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmNewPassword ? 'text' : 'password'}
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            className="w-full px-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeForgotPasswordModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                        style={{ background: '#8BC342' }}
                                    >
                                        {forgotLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {forgotLoading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {forgotStep === 'success' && (
                            <div className="space-y-4 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {forgotMethod === 'magic' ? 'Check your email!' : 'Password Reset Successful!'}
                                    </h3>
                                    <p className="text-gray-600">
                                        {forgotMethod === 'magic'
                                            ? `We've sent a magic reset link to ${forgotEmail}. Please check your inbox and follow the instructions.`
                                            : 'You can now sign in with your new password.'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeForgotPasswordModal}
                                    className="w-full px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-colors"
                                    style={{ background: '#8BC342' }}
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
