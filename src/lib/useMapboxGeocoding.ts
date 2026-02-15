import { useState, useCallback } from 'react';
import { MapboxGeocodingService, GeocodingResult, GeocodingOptions } from './mapboxGeocodingService';

export interface UseMapboxGeocodingReturn {
    /**
     * Main geocode function - works with address or zipcode
     */
    geocode: (query: string, options?: GeocodingOptions) => Promise<GeocodingResult>;
    
    /**
     * Search by address specifically
     */
    geocodeAddress: (address: string, options?: GeocodingOptions) => Promise<GeocodingResult>;
    
    /**
     * Search by zipcode specifically
     */
    geocodeZipcode: (zipcode: string, options?: GeocodingOptions) => Promise<GeocodingResult>;
    
    /**
     * Get multiple results (for autocomplete)
     */
    geocodeMultiple: (query: string, options?: GeocodingOptions) => Promise<GeocodingResult[]>;
    
    /**
     * Reverse geocoding - coordinates to address
     */
    reverseGeocode: (longitude: number, latitude: number, options?: GeocodingOptions) => Promise<GeocodingResult>;
    
    /**
     * Current loading state
     */
    isLoading: boolean;
    
    /**
     * Latest geocoding result
     */
    result: GeocodingResult | null;
    
    /**
     * Latest error message
     */
    error: string | null;
    
    /**
     * Multiple results (from geocodeMultiple)
     */
    results: GeocodingResult[];
    
    /**
     * Reset state
     */
    reset: () => void;
    
    /**
     * Check if service is configured
     */
    isConfigured: boolean;
}

/**
 * React hook for Mapbox geocoding
 * 
 * @example
 * ```typescript
 * const { geocode, isLoading, result } = useMapboxGeocoding();
 * 
 * const handleSearch = async () => {
 *   const result = await geocode('New York');
 *   if (result.success) {
 *     console.log(result.latitude, result.longitude);
 *   }
 * };
 * ```
 */
export function useMapboxGeocoding(apiToken?: string): UseMapboxGeocodingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GeocodingResult | null>(null);
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [service] = useState(() => new MapboxGeocodingService(apiToken));

    const geocode = useCallback(async (query: string, options?: GeocodingOptions): Promise<GeocodingResult> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const geocodingResult = await service.geocode(query, options);
            setResult(geocodingResult);
            
            if (!geocodingResult.success) {
                setError(geocodingResult.error || 'Geocoding failed');
            }
            
            return geocodingResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            const errorResult: GeocodingResult = {
                success: false,
                error: errorMessage
            };
            setResult(errorResult);
            return errorResult;
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const geocodeAddress = useCallback(async (address: string, options?: GeocodingOptions): Promise<GeocodingResult> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const geocodingResult = await service.geocodeAddress(address, options);
            setResult(geocodingResult);
            
            if (!geocodingResult.success) {
                setError(geocodingResult.error || 'Geocoding failed');
            }
            
            return geocodingResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            const errorResult: GeocodingResult = {
                success: false,
                error: errorMessage
            };
            setResult(errorResult);
            return errorResult;
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const geocodeZipcode = useCallback(async (zipcode: string, options?: GeocodingOptions): Promise<GeocodingResult> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const geocodingResult = await service.geocodeZipcode(zipcode, options);
            setResult(geocodingResult);
            
            if (!geocodingResult.success) {
                setError(geocodingResult.error || 'Geocoding failed');
            }
            
            return geocodingResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            const errorResult: GeocodingResult = {
                success: false,
                error: errorMessage
            };
            setResult(errorResult);
            return errorResult;
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const geocodeMultiple = useCallback(async (query: string, options?: GeocodingOptions): Promise<GeocodingResult[]> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const geocodingResults = await service.geocodeMultiple(query, options);
            setResults(geocodingResults);
            
            if (geocodingResults.length === 0) {
                setError('No results found');
            }
            
            return geocodingResults;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setResults([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const reverseGeocode = useCallback(async (
        longitude: number,
        latitude: number,
        options?: GeocodingOptions
    ): Promise<GeocodingResult> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const geocodingResult = await service.reverseGeocode(longitude, latitude, options);
            setResult(geocodingResult);
            
            if (!geocodingResult.success) {
                setError(geocodingResult.error || 'Reverse geocoding failed');
            }
            
            return geocodingResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            const errorResult: GeocodingResult = {
                success: false,
                error: errorMessage
            };
            setResult(errorResult);
            return errorResult;
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const reset = useCallback(() => {
        setResult(null);
        setResults([]);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        geocode,
        geocodeAddress,
        geocodeZipcode,
        geocodeMultiple,
        reverseGeocode,
        isLoading,
        result,
        results,
        error,
        reset,
        isConfigured: service.isConfigured()
    };
}

export default useMapboxGeocoding;
