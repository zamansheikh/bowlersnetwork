'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/types';
import { authApi, userApi } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check stored authentication on mount
        const checkAuth = async () => {
            try {
                const storedToken = localStorage.getItem('access_token');
                const storedUser = localStorage.getItem('user');

                if (storedToken) {
                    // If we have a token, try to fetch the latest profile data
                    try {
                        // Set token for api client (in case it wasn't set yet)
                        // Note: api interceptor reads from localStorage, so just ensuring it's there is enough

                        const userProfile = await userApi.getProfile();
                        const userData: User = {
                            ...userProfile,
                            user_id: (userProfile as any).user_id || (userProfile as any).id,
                            id: (userProfile as any).user_id || (userProfile as any).id,
                            is_complete: (userProfile as any).is_complete ?? true,
                            authenticated: true,
                            access_token: storedToken
                        };

                        localStorage.setItem('user', JSON.stringify(userData));
                        setUser(userData);
                    } catch (apiError) {
                        console.error('Error fetching profile on mount:', apiError);
                        // Fallback to stored user if API fails
                        if (storedUser) {
                            const userData = JSON.parse(storedUser);
                            if (userData.authenticated) {
                                setUser({ ...userData, access_token: storedToken });
                            }
                        }
                    }
                } else if (storedUser) {
                    // Fallback if only user data exists but no token (unlikely but possible)
                    const userData = JSON.parse(storedUser);
                    if (userData.authenticated) {
                        setUser(userData);
                    }
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const signin = async (username: string, password: string): Promise<{ success: boolean; profileComplete?: boolean }> => {
        try {
            setIsLoading(true);

            // Call authentication API
            const loginResponse = await authApi.login(username, password);

            if (loginResponse && loginResponse.access_token) {
                const { access_token } = loginResponse;

                // Store token in both localStorage and cookies
                localStorage.setItem('access_token', access_token);
                setCookie('access_token', access_token, 7);

                // Fetch user profile
                const userProfile = await userApi.getProfile();

                const userData: User = {
                    ...userProfile,
                    user_id: (userProfile as any).user_id || (userProfile as any).id,
                    id: (userProfile as any).user_id || (userProfile as any).id,
                    is_complete: (userProfile as any).is_complete ?? true,
                    authenticated: true,
                    access_token: access_token
                };

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);

                // Return success and profile completion status
                return {
                    success: true,
                    profileComplete: (userProfile as any).is_complete ?? true
                };
            }

            return { success: false };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const privateLogin = async (privateKey: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            console.log('Starting private login with key:', privateKey);

            // Call private login API with the private key
            const response = await fetch('/api/private-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    private_key: privateKey
                })
            });

            console.log('Private login response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Private login error response:', errorData);
                return {
                    success: false,
                    error: errorData.error || 'Authentication failed'
                };
            }

            const loginResponse = await response.json();
            console.log('Private login response:', loginResponse);

            if (loginResponse && loginResponse.access_token) {
                const { access_token } = loginResponse;
                console.log('Access token received, storing...');

                // Store token in both localStorage and cookies
                localStorage.setItem('access_token', access_token);
                setCookie('access_token', access_token, 7);

                // Fetch full user profile immediately (same as signin)
                const userProfile = await userApi.getProfile();

                const userData: User = {
                    ...userProfile,
                    user_id: (userProfile as any).user_id || (userProfile as any).id,
                    id: (userProfile as any).user_id || (userProfile as any).id,
                    is_complete: (userProfile as any).is_complete ?? true,
                    authenticated: true,
                    access_token: access_token
                };

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);

                console.log('Private login successful, user authenticated');
                return { success: true };
            }

            console.error('No access_token in response');
            return {
                success: false,
                error: 'Invalid response from server'
            };
        } catch (error) {
            console.error('Private login error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An error occurred'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const validatePrivateKey = async (privateKey: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            // Reusing private-login for validation as it's the only one we have
            // But we don't save the token yet
            const response = await fetch('/api/private-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ private_key: privateKey })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.error || 'Invalid private key' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Validation failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const betaPrivateSignup = async (privateKey: string, userData: any): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            const response = await authApi.betaPrivateSignup(privateKey, userData);
            return { success: true };
        } catch (error: any) {
            console.error('Beta signup error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Signup failed'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const signout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        deleteCookie('access_token');
        setUser(null);
        router.push('/signin');
    };

    const signup = async (userData: {
        signup_data: {
            first_name: string;
            last_name: string;
            username: string;
            email: string;
            password: string;
        };
        verification_code: string | null;
    }): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Call signup API with the new structure
            await authApi.signup(userData);

            // Auto-login after successful signup using basic info
            const signinResult = await signin(userData.signup_data.username, userData.signup_data.password);
            return signinResult.success;

        } catch (error) {
            console.error('Signup error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to set cookies
    const setCookie = (name: string, value: string, days: number = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    };

    // Helper function to delete cookies
    const deleteCookie = (name: string) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    };

    // Function to refresh user data
    const refreshUser = async (): Promise<void> => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const profileResponse = await userApi.getProfile();
            const userData: User = {
                ...profileResponse,
                user_id: (profileResponse as any).user_id || (profileResponse as any).id,
                id: (profileResponse as any).user_id || (profileResponse as any).id,
                is_complete: (profileResponse as any).is_complete ?? true,
                authenticated: true,
                access_token: token
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    // Emergency fix: Force logout for 'jayfettig' user one time to clear shared sessions
    useEffect(() => {
        if (user && (user.username === 'jayfettig' || user.username === 'zamansheikh')) { // Replace 12345 with actual user_id if known
            const hasLogoutFix = localStorage.getItem('jayfettig_security_logout_applied');
            if (!hasLogoutFix) {
                console.log('Executing mandatory security logout for jayfettig');
                // Set flag BEFORE signout to ensure it persists
                localStorage.setItem('jayfettig_security_logout_applied', 'true');
                signout();
            }
        }
    }, [user, signout]);

    return (
        <AuthContext.Provider value={{ user, isLoading, signin, privateLogin, validatePrivateKey, betaPrivateSignup, signup, signout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}
