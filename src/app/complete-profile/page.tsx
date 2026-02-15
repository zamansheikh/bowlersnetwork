'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

interface MapboxFeature {
    id: string;
    place_name: string;
    center: [number, number];
    text: string;
}

export default function CompleteProfilePage() {
    const { user, isLoading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Playing Style Information
    const [handedness, setHandedness] = useState(''); // 'left', 'right', 'both'
    const [thumbStyle, setThumbStyle] = useState(''); // 'thumb', 'no-thumb'

    // Step 2: Basic Info & Location
    const [age, setAge] = useState('');
    const [gender, setGender] = useState(''); // 'male', 'female', 'other'
    const [addressStr, setAddressStr] = useState('');
    const [lat, setLat] = useState('');
    const [long, setLong] = useState('');
    const [homeCenter, setHomeCenter] = useState('');
    const [homeCenterSearch, setHomeCenterSearch] = useState('');
    const [showCenterSuggestions, setShowCenterSuggestions] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<MapboxFeature[]>([]);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [addressSearchQuery, setAddressSearchQuery] = useState('');
    const addressInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Mock bowling centers data - in production, this would come from an API
    const mockBowlingCenters = [
        { id: 1, name: 'Stone Lane Bowling Center', city: 'Los Angeles', state: 'CA', lat: 34.0522, long: -118.2437 },
        { id: 2, name: 'AMF Bowl Pasadena', city: 'Pasadena', state: 'CA', lat: 34.1478, long: -118.1445 },
        { id: 3, name: 'Lucky Strike Chatter', city: 'Hollywood', state: 'CA', lat: 34.1028, long: -118.3259 },
        { id: 4, name: 'Bowling Barn', city: 'Santa Monica', state: 'CA', lat: 34.0195, long: -118.4912 },
        { id: 5, name: 'The Bowling Alley', city: 'Downtown LA', state: 'CA', lat: 34.0522, long: -118.2451 }
    ];

    // Step 3: Favorite Brands
    const [selectedBrands, setSelectedBrands] = useState({
        balls: [] as number[],
        shoes: [] as number[],
        accessories: [] as number[],
        apparels: [] as number[]
    });

    const [brands, setBrands] = useState<BrandsResponse | null>(null);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect to signin if not authenticated
    useEffect(() => {
        if (!authLoading && (!user || !user.authenticated)) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    // Load any existing temporary data
    useEffect(() => {
        // Load profile data if it exists
        const storedProfileData = localStorage.getItem('temp_profile_data');
        if (storedProfileData) {
            try {
                const profileData = JSON.parse(storedProfileData);
                setHandedness(profileData.handedness || '');
                setThumbStyle(profileData.thumb_style || '');
            } catch (error) {
                console.error('Error loading stored profile data:', error);
            }
        }

        // Load location data if it exists
        const storedLocationData = localStorage.getItem('temp_location_data');
        if (storedLocationData) {
            try {
                const locationData = JSON.parse(storedLocationData);
                setAge(locationData.age?.toString() || '');
                setGender(locationData.gender || '');
                setAddressStr(locationData.address_str || '');
                setLat(locationData.lat?.toString() || '');
                setLong(locationData.long?.toString() || '');
                setHomeCenter(locationData.home_center || '');
            } catch (error) {
                console.error('Error loading stored location data:', error);
            }
        }
    }, []);

    // Fetch brands data
    useEffect(() => {
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

        if (currentStep === 3) {
            fetchBrands();
        }
    }, [currentStep]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-green-600">Loading...</div>
            </div>
        );
    }

    // Don't render anything if user is not authenticated (will redirect)
    if (!user || !user.authenticated) {
        return null;
    }

    const handleBrandToggle = (category: keyof typeof selectedBrands, brandId: number) => {
        setSelectedBrands(prev => ({
            ...prev,
            [category]: prev[category].includes(brandId)
                ? prev[category].filter(id => id !== brandId)
                : [...prev[category], brandId]
        }));
    };

    // Mapbox Geocoding API search function
    const searchAddress = async (query: string) => {
        if (!query.trim()) {
            setAddressSuggestions([]);
            return;
        }

        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!mapboxToken) {
            console.error('Mapbox access token is not configured');
            return;
        }

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=address,place&limit=5`
            );
            const data = await response.json();

            if (data.features) {
                setAddressSuggestions(data.features);
                setShowAddressSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        }
    };

    // Handle address input change with debounce
    const handleAddressChange = (value: string) => {
        setAddressSearchQuery(value);
        setAddressStr(value);

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for debounced search
        debounceTimerRef.current = setTimeout(() => {
            searchAddress(value);
        }, 300); // 300ms debounce
    };

    // Handle suggestion selection
    const handleSelectAddress = (suggestion: MapboxFeature) => {
        setAddressStr(suggestion.place_name);
        setAddressSearchQuery(suggestion.place_name);
        setLat(suggestion.center[1].toString()); // Latitude
        setLong(suggestion.center[0].toString()); // Longitude
        setShowAddressSuggestions(false);
        setAddressSuggestions([]);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                addressInputRef.current &&
                !addressInputRef.current.contains(event.target as Node)
            ) {
                setShowAddressSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const validateStep1 = () => {
        if (!handedness) {
            setError('Please select your handedness (left, right, or both)');
            return false;
        }
        if (!thumbStyle) {
            setError('Please select your thumb style');
            return false;
        }
        setError('');
        return true;
    };

    const validateStep2 = () => {
        if (!age) {
            setError('Please enter your age');
            return false;
        }
        if (!gender) {
            setError('Please select your gender');
            return false;
        }
        if (!addressStr) {
            setError('Please enter your address');
            return false;
        }
        if (!homeCenter && !homeCenterSearch) {
            setError('Please enter or select a home bowling center');
            return false;
        }
        // Allow either selected homeCenter or typed homeCenterSearch
        if (!homeCenter && homeCenterSearch) {
            setHomeCenter(homeCenterSearch);
        }
        setError('');
        return true;
    };

    // Save bowling profile data (step 1) - to API
    const saveProfileData = async () => {
        const profileData = {
            handedness: handedness,
            thumb_style: thumbStyle,
        };

        // Store locally for reference
        localStorage.setItem('temp_profile_data', JSON.stringify(profileData));

        // Send to API
        try {
            await userApi.updateUserInfo(profileData);
        } catch (err) {
            console.error('Error saving profile data to API:', err);
            // Don't fail step progression if API call fails
        }
    };

    // Save location data (step 2) - to API
    const saveLocationData = async () => {
        const locationData = {
            age: parseInt(age),
            gender: gender,
            address_str: addressStr,
            lat: lat ? parseFloat(lat) : null,
            long: long ? parseFloat(long) : null,
            home_center: homeCenter,
        };

        // Store locally for reference
        localStorage.setItem('temp_location_data', JSON.stringify(locationData));

        // Send to API
        try {
            await userApi.updateUserInfo(locationData);
        } catch (err) {
            console.error('Error saving location data to API:', err);
            // Don't fail step progression if API call fails
        }
    };

    const handleNext = async () => {
        if (currentStep === 1 && validateStep1()) {
            await saveProfileData();
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            await saveLocationData();
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Get stored profile and location data
            const storedProfileData = localStorage.getItem('temp_profile_data');
            const storedLocationData = localStorage.getItem('temp_location_data');

            // Parse stored data
            const profileData = storedProfileData ? JSON.parse(storedProfileData) : {};
            const locationData = storedLocationData ? JSON.parse(storedLocationData) : {};

            // Combine all profile data and mark as complete
            const completeProfileData = {
                ...profileData,
                ...locationData,
                is_complete: true
            };

            // Update profile with all collected data
            // await userApi.updateProfile(completeProfileData);


            // Flatten all selected brand IDs into a single array
            const allBrandIDs = [
                ...selectedBrands.balls,
                ...selectedBrands.shoes,
                ...selectedBrands.accessories,
                ...selectedBrands.apparels
            ];

            // Call the dedicated brands API with the correct payload format
            await userApi.updateFavoriteBrands(allBrandIDs);

            // Refresh user data to get updated profile status
            await refreshUser();

            // Clean up temporary storage
            localStorage.removeItem('temp_profile_data');
            localStorage.removeItem('temp_location_data');

            // Redirect to home page after completing brands selection
            router.push('/');
        } catch (err) {
            console.error('Profile completion error:', err);
            setError('An error occurred while saving your profile. Please try again.');
        } finally {
            setIsLoading(false);
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
                    <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Step {currentStep} of 3
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={
                    currentStep === 3 ? handleSubmit : async (e) => {
                        e.preventDefault();
                        await handleNext();
                    }
                }>
                    
                    {/* Step 1: Playing Style & Bowling Preference */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 text-center">Playing Style</h3>

                            {/* Handedness */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Handedness
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="handedness"
                                            value="left"
                                            checked={handedness === 'left'}
                                            onChange={(e) => setHandedness(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Left Handed</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="handedness"
                                            value="right"
                                            checked={handedness === 'right'}
                                            onChange={(e) => setHandedness(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Right Handed</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="handedness"
                                            value="both"
                                            checked={handedness === 'both'}
                                            onChange={(e) => setHandedness(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Both Handed</span>
                                    </label>
                                </div>
                            </div>

                            {/* Thumb Style */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Thumb Style
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="thumbStyle"
                                            value="thumb"
                                            checked={thumbStyle === 'thumb'}
                                            onChange={(e) => setThumbStyle(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">With Thumb</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="thumbStyle"
                                            value="no-thumb"
                                            checked={thumbStyle === 'no-thumb'}
                                            onChange={(e) => setThumbStyle(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">No Thumb</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Basic Info & Location */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 text-center">Basic Information & Location</h3>

                            {/* Age */}
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                                    Age
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    min="13"
                                    required
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter your age"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Gender
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={gender === 'male'}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Male</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={gender === 'female'}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Female</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="other"
                                            checked={gender === 'other'}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Other</span>
                                    </label>
                                </div>
                            </div>

                            {/* Address with Mapbox Autocomplete */}
                            <div className="relative">
                                <label htmlFor="addressStr" className="block text-sm font-medium text-gray-700 mb-2">
                                    Street Address
                                </label>
                                <div className="relative">
                                    <input
                                        ref={addressInputRef}
                                        id="addressStr"
                                        name="addressStr"
                                        type="text"
                                        required
                                        value={addressSearchQuery}
                                        onChange={(e) => handleAddressChange(e.target.value)}
                                        onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter your address (e.g., 123 Main St, New York)"
                                        autoComplete="off"
                                    />
                                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>

                                {/* Address Suggestions Dropdown */}
                                {showAddressSuggestions && addressSuggestions.length > 0 && (
                                    <div
                                        ref={suggestionsRef}
                                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                    >
                                        {addressSuggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                type="button"
                                                onClick={() => handleSelectAddress(suggestion)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {suggestion.text}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {suggestion.place_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Latitude & Longitude */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="lat" className="block text-sm font-medium text-gray-700">
                                        Latitude
                                    </label>
                                    <input
                                        id="lat"
                                        name="lat"
                                        type="number"
                                        step="any"
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-gray-50"
                                        placeholder="Auto-filled"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="long" className="block text-sm font-medium text-gray-700">
                                        Longitude
                                    </label>
                                    <input
                                        id="long"
                                        name="long"
                                        type="number"
                                        step="any"
                                        value={long}
                                        onChange={(e) => setLong(e.target.value)}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-gray-50"
                                        placeholder="Auto-filled"
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Home Center Dropdown */}
                            <div className="relative">
                                <label htmlFor="homeCenter" className="block text-sm font-medium text-gray-700 mb-2">
                                    Home Bowling Center
                                </label>
                                <input
                                    id="homeCenter"
                                    name="homeCenterSearch"
                                    type="text"
                                    required
                                    value={homeCenterSearch}
                                    onChange={(e) => {
                                        setHomeCenterSearch(e.target.value);
                                        setShowCenterSuggestions(e.target.value.length > 0);
                                    }}
                                    onFocus={() => setShowCenterSuggestions(homeCenterSearch.length > 0)}
                                    onBlur={() => setTimeout(() => setShowCenterSuggestions(false), 200)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Search or type a bowling center name"
                                    autoComplete="off"
                                />
                                {showCenterSuggestions && homeCenterSearch.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {mockBowlingCenters
                                            .filter(center =>
                                                center.name.toLowerCase().includes(homeCenterSearch.toLowerCase()) ||
                                                center.city.toLowerCase().includes(homeCenterSearch.toLowerCase())
                                            )
                                            .map((center) => (
                                                <div
                                                    key={center.id}
                                                    onClick={() => {
                                                        setHomeCenter(center.name);
                                                        setHomeCenterSearch(center.name);
                                                        setShowCenterSuggestions(false);
                                                    }}
                                                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                                                >
                                                    <div className="text-sm font-medium text-gray-900">{center.name}</div>
                                                    <div className="text-xs text-gray-500">{center.city}, {center.state}</div>
                                                </div>
                                            ))}
                                        {mockBowlingCenters.filter(center =>
                                            center.name.toLowerCase().includes(homeCenterSearch.toLowerCase()) ||
                                            center.city.toLowerCase().includes(homeCenterSearch.toLowerCase())
                                        ).length === 0 && (
                                                <div className="space-y-3 p-4">
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        No centers found for "{homeCenterSearch}"
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setHomeCenter(homeCenterSearch);
                                                            setShowCenterSuggestions(false);
                                                        }}
                                                        className="w-full px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg transition-colors border border-green-200"
                                                    >
                                                        ✓ Use "{homeCenterSearch}" as custom center
                                                    </button>
                                                    <div className="text-xs text-gray-500 border-t pt-2">
                                                        💡 You can use custom bowling center names. The location will be filled by our system.
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                )}
                                {homeCenter && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="text-xs text-green-600 font-medium">✓ Selected</div>
                                        <div className="text-sm text-gray-900 font-medium mt-1">{homeCenter}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Favorite Brands */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 text-center">Choose Your Favorite Brands</h3>
                            <p className="text-sm text-gray-600 text-center">Select brands you&apos;re interested in (optional). Your profile will be saved when you complete this step.</p>

                            {brandsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="text-gray-500">Loading brands...</div>
                                </div>
                            ) : brands ? (
                                <>
                                    {/* Ball Brands */}
                                    {brands.Balls && brands.Balls.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-medium text-gray-800 mb-3">Ball Brands</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {brands.Balls.map((brand) => (
                                                    <label key={brand.brand_id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBrands.balls.includes(brand.brand_id)}
                                                            onChange={() => handleBrandToggle('balls', brand.brand_id)}
                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        />
                                                        <Image
                                                            src={brand.logo_url}
                                                            alt={`${brand.formal_name} logo`}
                                                            width={32}
                                                            height={32}
                                                            className="object-contain"
                                                        />
                                                        <span className="text-sm text-gray-700 flex-1">{brand.formal_name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Shoes */}
                                    {brands.Shoes && brands.Shoes.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-medium text-gray-800 mb-3">Shoes</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {brands.Shoes.map((brand) => (
                                                    <label key={brand.brand_id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBrands.shoes.includes(brand.brand_id)}
                                                            onChange={() => handleBrandToggle('shoes', brand.brand_id)}
                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        />
                                                        <Image
                                                            src={brand.logo_url}
                                                            alt={`${brand.formal_name} logo`}
                                                            width={32}
                                                            height={32}
                                                            className="object-contain"
                                                        />
                                                        <span className="text-sm text-gray-700 flex-1">{brand.formal_name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Accessories */}
                                    {brands.Accessories && brands.Accessories.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-medium text-gray-800 mb-3">Accessories</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {brands.Accessories.map((brand) => (
                                                    <label key={brand.brand_id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBrands.accessories.includes(brand.brand_id)}
                                                            onChange={() => handleBrandToggle('accessories', brand.brand_id)}
                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        />
                                                        <Image
                                                            src={brand.logo_url}
                                                            alt={`${brand.formal_name} logo`}
                                                            width={32}
                                                            height={32}
                                                            className="object-contain"
                                                        />
                                                        <span className="text-sm text-gray-700 flex-1">{brand.formal_name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Apparel */}
                                    {brands.Apparels && brands.Apparels.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-medium text-gray-800 mb-3">Apparel</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {brands.Apparels.map((brand) => (
                                                    <label key={brand.brand_id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBrands.apparels.includes(brand.brand_id)}
                                                            onChange={() => handleBrandToggle('apparels', brand.brand_id)}
                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        />
                                                        <Image
                                                            src={brand.logo_url}
                                                            alt={`${brand.formal_name} logo`}
                                                            width={32}
                                                            height={32}
                                                            className="object-contain"
                                                        />
                                                        <span className="text-sm text-gray-700 flex-1">{brand.formal_name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">Failed to load brands. Please try again.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            {currentStep === 3
                                ? (isLoading ? 'Completing Profile...' : 'Complete Profile')
                                : (isLoading ? 'Please wait...' : 'Next')
                            }
                        </button>
                    </div>

                    {currentStep === 3 && (
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                By completing your profile, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
