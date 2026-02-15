'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
    Upload, Loader2, AlertCircle, Check, X, Copy, Trash2,
    Image as ImageIcon, Palette, Activity, ArrowLeft, Sparkles
} from 'lucide-react';
import { useCloudUpload } from '@/lib/useCloudUpload';

interface Design {
    design_id: number;
    name: string;
    code_name: string;
}

interface Brand {
    brand_id: number;
    brandType: string;
    name: string;
    formal_name: string;
    logo_url: string;
}

interface BrandsResponse {
    [category: string]: Brand[];
}

interface CardInfo {
    xp: number;
    home_center_name: string;
    bowling_stat: {
        average: number;
        high_game: number;
        high_series: number;
        experience: number;
    };
    ball_handling_style: {
        description: string;
        is_public: boolean;
        is_added: boolean;
    };
}

export default function GenerateTradingCardPage() {
    const router = useRouter();
    
    // Design
    const [designs, setDesigns] = useState<Design[]>([]);
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
    const [loadingDesigns, setLoadingDesigns] = useState(true);
    
    // Brands
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(true);
    
    // User inputs only
    const [displayPictureUrl, setDisplayPictureUrl] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#97ABE2');
    
    // Upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageUploaded, setImageUploaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile, progress, speed, isUploading } = useCloudUpload();
    
    // Card generation
    const [cardHtml, setCardHtml] = useState('');
    const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch designs and brands on mount
    useEffect(() => {
        fetchDesigns();
        fetchBrands();
    }, []);

    const fetchDesigns = async () => {
        try {
            setLoadingDesigns(true);
            const response = await api.get('/api/cards/designs');
            setDesigns(response.data);
            if (response.data.length > 0) {
                setSelectedDesign(response.data[0]);
            }
        } catch (err: any) {
            console.error('Error fetching designs:', err);
            setError('Failed to load card designs');
        } finally {
            setLoadingDesigns(false);
        }
    };

    const fetchBrands = async () => {
        try {
            setLoadingBrands(true);
            const response = await api.get('/api/brands');
            const brandsData: BrandsResponse = response.data;
            
            // Flatten all brands from all categories
            const allBrands: Brand[] = [];
            Object.values(brandsData).forEach((categoryBrands) => {
                allBrands.push(...categoryBrands);
            });
            
            setBrands(allBrands);
        } catch (err: any) {
            console.error('Error fetching brands:', err);
            setError('Failed to load brands');
        } finally {
            setLoadingBrands(false);
        }
    };

    const handleBrandToggle = (brandId: number) => {
        setSelectedBrands(prev => {
            if (prev.includes(brandId)) {
                return prev.filter(id => id !== brandId);
            } else if (prev.length < 4) {
                return [...prev, brandId];
            }
            return prev;
        });
    };

    // Handle file selection with immediate upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setSelectedFile(file);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Immediately upload to cloud
        try {
            const result = await uploadFile(file, 'cdn');
            
            if (result.success && result.publicUrl) {
                setDisplayPictureUrl(result.publicUrl);
                setImageUploaded(true);
                setSuccess('Image uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error || 'Failed to upload image');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageUploaded(false);
        setDisplayPictureUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGenerateCard = async () => {
        if (!selectedDesign) {
            setError('Please select a card design');
            return;
        }

        if (selectedBrands.length !== 4) {
            setError('Please select exactly 4 brands');
            return;
        }

        if (!displayPictureUrl.trim()) {
            setError('Please upload a display picture');
            return;
        }

        if (!displayName.trim()) {
            setError('Please provide a display name');
            return;
        }

        if (displayName.length > 18) {
            setError('Display name must be 18 characters or less');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const finalColor = primaryColor.length === 7 ? primaryColor + 'ff' : primaryColor;
            
            const response = await api.post('/api/cards/preview', {
                design_id: selectedDesign.design_id,
                brand_ids: selectedBrands,
                params: {
                    display_picture_url: displayPictureUrl,
                    display_name: displayName,
                    primary_color: finalColor
                }
            });

            if (response.data.card_html_str) {
                setCardHtml(response.data.card_html_str);
                setCardInfo(response.data.card_info);
                setSuccess('Card generated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('No card HTML returned from API');
            }
        } catch (err: any) {
            console.error('Error generating card:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to generate card';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCard = async () => {
        if (!selectedDesign || !displayPictureUrl || !displayName || selectedBrands.length !== 4) {
            setError('Please generate the card first');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const finalColor = primaryColor.length === 7 ? primaryColor + 'ff' : primaryColor;
            
            await api.post('/api/cards', {
                design_id: selectedDesign.design_id,
                brand_ids: selectedBrands,
                params: {
                    display_picture_url: displayPictureUrl,
                    display_name: displayName,
                    primary_color: finalColor
                }
            });

            setSuccess('Card saved successfully!');
            setTimeout(() => {
                router.push('/trading-cards');
            }, 1000);
        } catch (err: any) {
            console.error('Error saving card:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save card';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toast Notifications - Fixed Position */}
            {error && (
                <div className="fixed top-20 right-4 z-[100] bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-md">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                    <button onClick={() => setError('')} className="ml-2 hover:text-red-900 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {success && (
                <div className="fixed top-20 right-4 z-[100] bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-md">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-2 hover:text-green-900 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <script src="https://cdn.tailwindcss.com" async></script>
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                {/* Sticky Top Bar */}
                <div className="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.push('/trading-cards')}
                                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-all hover:bg-gray-100 px-3 py-2 rounded-lg duration-200"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Trading Card Generator</h1>
                                    <p className="text-xs text-gray-500">Design your personalized card</p>
                                </div>
                            </div>
                            {cardHtml && (
                                <button
                                    onClick={handleSaveCard}
                                    disabled={loading}
                                    className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Save Card
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-4">

                    {/* Main Content - Compact Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* LEFT COLUMN - Inputs */}
                        <div className="lg:col-span-1 space-y-2">
                            {/* Design Selection - Compact */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Card Design</h3>
                                        <p className="text-xs text-gray-500">Choose your style</p>
                                    </div>
                                </div>
                                
                                {loadingDesigns ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={selectedDesign?.design_id || ''}
                                            onChange={(e) => {
                                                const design = designs.find(d => d.design_id === Number(e.target.value));
                                                if (design) setSelectedDesign(design);
                                            }}
                                            className="w-full appearance-none px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                                        >
                                            {designs.map((design) => (
                                                <option key={design.design_id} value={design.design_id}>
                                                    {design.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Brand Selection - Compact */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Select Brands</h3>
                                        <p className="text-xs text-gray-500">{selectedBrands.length}/4 selected</p>
                                    </div>
                                </div>
                                
                                {loadingBrands ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                                        {brands.map((brand) => (
                                            <button
                                                key={brand.brand_id}
                                                onClick={() => handleBrandToggle(brand.brand_id)}
                                                disabled={!selectedBrands.includes(brand.brand_id) && selectedBrands.length >= 4}
                                                className={`relative aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                                                    selectedBrands.includes(brand.brand_id)
                                                        ? 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-offset-1'
                                                        : 'border-gray-200 hover:border-amber-400 bg-white'
                                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                title={brand.name}
                                            >
                                                <img
                                                    src={brand.logo_url}
                                                    alt={brand.name}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                                {selectedBrands.includes(brand.brand_id) && (
                                                    <div className="absolute top-0.5 right-0.5 bg-green-500 text-white rounded-full p-0.5">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Photo Upload - Compact */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Profile Photo</h3>
                                        <p className="text-xs text-gray-500">Upload your image</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-2 hover:border-blue-500 transition bg-gray-50 h-24 flex items-center justify-center">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="photo-upload"
                                            disabled={isUploading}
                                        />
                                        
                                        <label
                                            htmlFor="photo-upload"
                                            className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                                        >
                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-xs font-medium text-gray-700 text-center">
                                                Click to upload
                                            </span>
                                        </label>
                                    </div>

                                    {previewUrl && (
                                        <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            {imageUploaded && (
                                                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                                </div>
                                            )}
                                            <button
                                                onClick={handleClearFile}
                                                className="absolute bottom-1 right-1 bg-white/90 text-red-600 rounded p-1 hover:bg-white shadow-sm transition"
                                                title="Remove image"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Display Name - Compact */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <Activity className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Display Name</h3>
                                        <p className="text-xs text-gray-500">{displayName.length}/18 characters</p>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 18) {
                                            setDisplayName(e.target.value);
                                        }
                                    }}
                                    maxLength={18}
                                    placeholder="Enter your name"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                />
                            </div>

                            {/* Primary Color - Compact */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                                        <Palette className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Card Color</h3>
                                        <p className="text-xs text-gray-500">Hex code</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={primaryColor.substring(0, 7)}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => {
                                                const value = e.target.value.toUpperCase();
                                                if (value === '' || value === '#' || value.match(/^#[0-9A-F]{0,8}$/)) {
                                                    setPrimaryColor(value);
                                                }
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                const pastedText = e.clipboardData.getData('text').trim();
                                                if (pastedText.match(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/)) {
                                                    setPrimaryColor(pastedText.toUpperCase());
                                                } else {
                                                    setError('Invalid color code');
                                                    setTimeout(() => setError(''), 2000);
                                                }
                                            }}
                                            placeholder="#97ABE2FF"
                                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition font-mono text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(primaryColor);
                                                setSuccess('Copied!');
                                                setTimeout(() => setSuccess(''), 1500);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition"
                                        >
                                            <Copy className="w-3 h-3" />
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => setPrimaryColor('#97ABE2')}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateCard}
                                disabled={loading || isUploading || !selectedDesign || selectedBrands.length !== 4 || !displayPictureUrl || !displayName}
                                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] disabled:shadow-none disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2 text-base mt-4"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Card
                                    </>
                                )}
                            </button>

                        </div>

                        {/* RIGHT SIDE - Compact Preview (2 columns) */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Live Preview</h3>
                                        <p className="text-xs text-gray-500">Your card will appear here</p>
                                    </div>
                                </div>

                                <div className="border-2 border-gray-100 rounded-xl bg-gray-50/50 p-4 min-h-[500px] flex items-center justify-center">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-3" />
                                            <p className="text-sm font-medium text-gray-600">Creating your masterpiece...</p>
                                        </div>
                                    ) : !cardHtml ? (
                                        <div className="flex flex-col items-center justify-center text-center max-w-xs">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                                                <Activity className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h4 className="text-base font-semibold text-gray-900 mb-1">Ready to Generate</h4>
                                            <p className="text-sm text-gray-500">Fill in the details on the left and click "Generate Card" to see your preview.</p>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
                                            <iframe 
                                                srcDoc={`
                                                    <!DOCTYPE html>
                                                    <html>
                                                        <head>
                                                            <style>
                                                                body { 
                                                                    margin: 0; 
                                                                    padding: 0; 
                                                                    display: flex; 
                                                                    justify-content: center; 
                                                                    align-items: center; 
                                                                    min-height: 100vh; 
                                                                    background: transparent;
                                                                    overflow: hidden;
                                                                    transform-origin: center center;
                                                                }
                                                                /* Scale down if too big */
                                                                .card-container {
                                                                    transform-origin: center center;
                                                                }
                                                            </style>
                                                        </head>
                                                        <body>
                                                            ${cardHtml}
                                                        </body>
                                                    </html>
                                                `}
                                                className="w-full h-[500px] border-0"
                                                title="Trading Card Preview"
                                                sandbox="allow-scripts allow-same-origin"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}