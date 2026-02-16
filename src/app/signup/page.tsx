'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { differenceInYears, parseISO } from 'date-fns';
import AddressModal from '@/components/AddressModal';
import { MapPin, ChevronRight, Check } from 'lucide-react';

// Brand Interfaces
interface Brand {
    brand_id: number;
    name: string;
    formal_name: string;
    logo_url: string;
}

interface BrandsResponse {
    Shoes: Brand[];
    Apparels: Brand[];
    Balls: Brand[];
    Accessories: Brand[];
}

export default function SignUpPage() {
    // Steps: 1. Basic Info, 2. Preferences (Address, Brands), 3. Verification
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();
    const { signup } = useAuth();

    // -- Form Data: Step 1 --
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dob, setDob] = useState(''); // YYYY-MM-DD
    const [parentEmail, setParentEmail] = useState('');
    const [isCoach, setIsCoach] = useState(false);

    // Derived state for age
    const [age, setAge] = useState<number | null>(null);
    const [isUnderage, setIsUnderage] = useState(false);

    // -- Form Data: Step 2 --
    // Address
    const [addressData, setAddressData] = useState({
        address_str: '',
        zipcode: '',
        lat: '',
        long: ''
    });
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Brands
    const [brands, setBrands] = useState<BrandsResponse | null>(null);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);

    // -- Form Data: Step 3 (Verification) --
    const [verificationCode, setVerificationCode] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // -- Effects --

    // Calculate age when DOB changes
    useEffect(() => {
        if (dob) {
            const birthDate = parseISO(dob);
            const today = new Date();
            const calculatedAge = differenceInYears(today, birthDate);
            setAge(calculatedAge);
            setIsUnderage(calculatedAge < 18);

            // Reset coach status if underage
            if (calculatedAge < 18) {
                setIsCoach(false);
            }
        } else {
            setAge(null);
            setIsUnderage(false);
        }
    }, [dob]);

    // Fetch brands when entering Step 2
    useEffect(() => {
        if (currentStep === 2 && !brands) {
            const fetchBrands = async () => {
                setBrandsLoading(true);
                try {
                    const response = await fetch('https://test.bowlersnetwork.com/api/brands');
                    if (response.ok) {
                        const data = await response.json();
                        setBrands(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch brands:', error);
                } finally {
                    setBrandsLoading(false);
                }
            };
            fetchBrands();
        }
    }, [currentStep, brands]);

    // -- Handlers --

    const validateStep1 = async (): Promise<boolean> => {
        setError('');
        setValidationErrors([]);

        if (!firstName || !lastName || !username || !email || !password || !confirmPassword || !dob) {
            setError('Please fill in all fields');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (age !== null && age < 13) {
            setError('You must be at least 13 years old to register.');
            return false;
        }

        if (isUnderage && !parentEmail) {
            setError('Parent/Guardian email is required for users under 18.');
            return false;
        }

        // Validate basic fields with API
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

    const handleStep1Next = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await validateStep1();
        if (isValid) {
            setCurrentStep(2);
        }
    };

    const handleStep2Next = async () => {
        // Validation for step 2 (Optional, but let's say address is recommended)
        // For now, we allow proceeding even without address/brands, or you can enforce it.
        // Let's enforce address for better data.
        if (!addressData.address_str) {
            setError('Please select your address.');
            return;
        }

        setError('');
        await sendVerificationCode();
    };

    const handleBrandToggle = (brandId: number) => {
        setSelectedBrandIds(prev =>
            prev.includes(brandId)
                ? prev.filter(id => id !== brandId)
                : [...prev, brandId]
        );
    };

    const sendVerificationCode = async () => {
        setIsSendingCode(true);
        setError('');

        try {
            await authApi.sendVerificationCode(email);
            setCodeSent(true);
            setCurrentStep(3);
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

            const postSignupData = {
                dob: {
                    date: dob,
                    is_underage: isUnderage,
                    parent_email: isUnderage ? parentEmail : null,
                    is_public: false
                },
                critical_info: {
                    is_coach: isCoach
                },
                address: {
                    address_str: addressData.address_str,
                    zipcode: addressData.zipcode,
                    lat: addressData.lat,
                    long: addressData.long
                },
                fav_brands: selectedBrandIds
            };

            const success = await signup({
                signup_data: signupData,
                verification_code: verificationCode || null,
                post_signup_data: postSignupData
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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
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
                    <p className="mt-2 text-sm text-gray-600">Step {currentStep} of 3</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
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

                    {/* STEP 1: Basic Info */}
                    {currentStep === 1 && (
                        <form className="space-y-6" onSubmit={handleStep1Next}>
                            <h3 className="text-lg font-medium text-gray-900 pb-2 border-b border-gray-100">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 8 chars"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    required
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                />
                                {age !== null && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Age: {age} years old
                                        {age < 13 && <span className="text-red-600 block">Must be 13 or older to join.</span>}
                                    </p>
                                )}
                            </div>

                            {/* Conditional Fields based on Age */}
                            {isUnderage && age !== null && age >= 13 && (
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <label className="block text-sm font-medium text-yellow-800">
                                        Parent/Guardian Email (Required for under 18)
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={parentEmail}
                                        onChange={(e) => setParentEmail(e.target.value)}
                                        className="mt-2 block w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="parent@example.com"
                                    />
                                </div>
                            )}

                            {!isUnderage && age !== null && (
                                <div className="flex items-center">
                                    <input
                                        id="isCoach"
                                        type="checkbox"
                                        checked={isCoach}
                                        onChange={(e) => setIsCoach(e.target.checked)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isCoach" className="ml-2 block text-sm text-gray-900 font-medium">
                                        Are you a youth coach?
                                    </label>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || (age !== null && age < 13)}
                                    className="w-full py-3 px-4 bg-[#8BC342] hover:bg-[#7ab035] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Checking...' : 'Next Step'}
                                    <ChevronRight className="w-5 h-5" />
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

                    {/* STEP 2: Address & Brands */}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 pb-2 border-b border-gray-100 mb-4">Location</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    {addressData.address_str ? (
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <MapPin className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{addressData.address_str}</p>
                                                {addressData.zipcode && <p className="text-sm text-gray-500">Zip: {addressData.zipcode}</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mb-3 italic">No address selected yet.</p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowAddressModal(true)}
                                        className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                                    >
                                        {addressData.address_str ? 'Change Address' : '+ Add Address'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 pb-2 border-b border-gray-100 mb-4">Favorite Brands (Optional)</h3>

                                {brandsLoading ? (
                                    <div className="text-center py-8 text-gray-500">Loading brands...</div>
                                ) : brands ? (
                                    <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {/* Helper to render brand section */}
                                        {Object.entries(brands).map(([category, categoryBrands]) => (
                                            categoryBrands && categoryBrands.length > 0 && (
                                                <div key={category}>
                                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">{category}</h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {categoryBrands.map((brand: Brand) => (
                                                            <div
                                                                key={brand.brand_id}
                                                                onClick={() => handleBrandToggle(brand.brand_id)}
                                                                className={`
                                                                    cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 relative
                                                                    ${selectedBrandIds.includes(brand.brand_id)
                                                                        ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                                                                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'}
                                                                `}
                                                            >
                                                                <div className="w-10 h-10 relative flex-shrink-0 bg-white rounded-lg p-1 border border-gray-100">
                                                                    <Image
                                                                        src={brand.logo_url}
                                                                        alt={brand.formal_name}
                                                                        fill
                                                                        className="object-contain"
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-900 leading-tight">{brand.formal_name}</span>
                                                                {selectedBrandIds.includes(brand.brand_id) && (
                                                                    <div className="absolute top-2 right-2 text-green-600">
                                                                        <Check className="w-4 h-4" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Failed to load brands.</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStep2Next}
                                    disabled={isSendingCode}
                                    className="flex-1 py-3 px-4 bg-[#8BC342] hover:bg-[#7ab035] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSendingCode ? 'Sending Code...' : 'Next'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Verification */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                                <p className="text-gray-600">
                                    We sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>
                                </p>
                            </div>

                            <div className="flex justify-center py-6">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-48 px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSignup}
                                disabled={isLoading || verificationCode.length !== 6}
                                className="w-full py-4 bg-[#8BC342] hover:bg-[#7ab035] text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Verify & Create Account'}
                            </button>

                            <div className="text-center space-y-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCodeSent(false);
                                        setVerificationCode('');
                                        sendVerificationCode();
                                    }}
                                    disabled={isSendingCode}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    {isSendingCode ? 'Sending...' : "Didn't receive the code? Resend"}
                                </button>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Back to previous step
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Address Modal */}
            <AddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSave={(address) => {
                    setAddressData({
                        address_str: address.address,
                        zipcode: address.zipcode,
                        lat: address.latitude,
                        long: address.longitude
                    });
                }}
                initialAddress={addressData.address_str}
                initialZipcode={addressData.zipcode}
            />
        </div>
    );
}