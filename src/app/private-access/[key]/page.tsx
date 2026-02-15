'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { Shield, User, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrivateAccessPage() {
    const router = useRouter();
    const params = useParams();
    const { validatePrivateKey, betaPrivateSignup } = useAuth();
    
    const [step, setStep] = useState<'validating' | 'signup' | 'success'>('validating');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    
    const privateKey = params?.key as string;
    const hasAttemptedValidation = useRef(false);

    useEffect(() => {
        const checkKey = async () => {
            if (hasAttemptedValidation.current || !privateKey) return;
            hasAttemptedValidation.current = true;

            try {
                setLoading(true);
                const result = await validatePrivateKey(privateKey);

                if (result.success) {
                    setStep('signup');
                } else {
                    setError(result.error || 'Invalid or expired access key.');
                }
            } catch (err) {
                setError('An error occurred during verification');
            } finally {
                setLoading(false);
            }
        };

        checkKey();
    }, [privateKey, validatePrivateKey]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Username validation
        const usernameRegex = /^[a-z][a-z0-9_]{3,}$/;
        if (!usernameRegex.test(formData.username)) {
            setError('Username must be at least 4 characters, start with a lowercase letter, and contain only lowercase letters, numbers, and underscores.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const result = await betaPrivateSignup(privateKey, {
                username: formData.username,
                password: formData.password
            });

            if (result.success) {
                setStep('success');
                // Automatically redirect after 3 seconds
                setTimeout(() => {
                    router.push('/signin');
                }, 3000);
            } else {
                setError(result.error || 'Failed to create account');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F02] bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-green-900/20 via-black to-black flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Header Logo/Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#86D864]/10 mb-4 border border-[#86D864]/20">
                        <Shield className="w-8 h-8 text-[#86D864]" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic">
                        BOWLERS <span className="text-[#86D864]">NETWORK</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">BETA ACCESS PROGRAM</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {step === 'validating' && (
                        <div className="py-8 text-center space-y-6">
                            <div className="relative w-20 h-20 mx-auto">
                                <div className="absolute inset-0 rounded-full border-4 border-[#86D864]/20"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-[#86D864] border-t-transparent animate-spin"></div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">Verifying Key</h2>
                                <p className="text-gray-400 text-sm italic">Synchronizing with Bowlers Network database...</p>
                            </div>
                        </div>
                    )}

                    {step === 'signup' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-white uppercase italic">Set Your Identity</h2>
                                <p className="text-gray-400 text-sm mt-1">Configure your beta account details</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-200 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSignup} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#86D864]/50 focus:border-[#86D864] transition-all"
                                            placeholder="Enter unique username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#86D864]/50 focus:border-[#86D864] transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#86D864]/50 focus:border-[#86D864] transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#86D864] hover:bg-[#7ac85a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(134,216,100,0.3)]"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            CREATE BETA ACCOUNT
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white italic">ACCOUNT SECURED</h2>
                                <p className="text-gray-400">Welcome to the inner circle. Redirecting you to the portal...</p>
                            </div>
                            <button
                                onClick={() => router.push('/signin')}
                                className="inline-flex items-center gap-2 text-[#86D864] font-bold hover:underline"
                            >
                                Proceed to Login now <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {error && step === 'validating' && (
                        <div className="py-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Access Denied</h2>
                                <p className="text-red-200/60 text-sm px-4">{error}</p>
                            </div>
                            <button
                                onClick={() => router.push('/landing')}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
                            >
                                RETURN TO SAFETY
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-gray-600 text-[10px] mt-8 font-black uppercase tracking-[0.2em]">
                    &copy; 2026 BOWLERS NETWORK &bull; ALL RIGHTS RESERVED
                </p>
            </div>
        </div>
    );
}