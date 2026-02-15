/**
 * Mapbox Geocoding Service
 * 
 * A reusable service for geocoding addresses and zipcodes using the Mapbox Geocoding API.
 * Supports searching by address string or zipcode and returns coordinates, full address, and postal code.
 * 
 * @example
 * ```typescript
 * const service = new MapboxGeocodingService();
 * const result = await service.geocode('New York');
 * console.log(result.latitude, result.longitude, result.address);
 * ```
 */

export interface GeocodingResult {
    success: boolean;
    latitude?: number;
    longitude?: number;
    address?: string;
    zipcode?: string;
    city?: string;
    state?: string;
    country?: string;
    placeId?: string;
    placeName?: string;
    error?: string;
}

export interface MapboxFeature {
    id: string;
    type: string;
    place_type: string[];
    relevance: number;
    properties: {
        accuracy?: string;
        [key: string]: any;
    };
    text: string;
    place_name: string;
    center: [number, number]; // [longitude, latitude]
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    context?: Array<{
        id: string;
        text: string;
        short_code?: string;
    }>;
}

export interface MapboxResponse {
    type: string;
    query: string[];
    features: MapboxFeature[];
    attribution: string;
}

export interface GeocodingOptions {
    /**
     * Maximum number of results to return
     * @default 1
     */
    limit?: number;
    
    /**
     * Filter by country (ISO 3166-1 alpha-2 country codes, comma-separated)
     * @example 'us,ca'
     */
    country?: string;
    
    /**
     * Bias results toward a location [longitude, latitude]
     * @example [-73.989, 40.733] // New York
     */
    proximity?: [number, number];
    
    /**
     * Filter results by type
     * @example ['postcode', 'place', 'address']
     */
    types?: string[];
    
    /**
     * Language code for response
     * @default 'en'
     */
    language?: string;
}

export class MapboxGeocodingService {
    private apiToken: string;
    private baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

    constructor(apiToken?: string) {
        // Try to get token from environment if not provided
        this.apiToken = apiToken || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
        
        if (!this.apiToken) {
            console.warn('Mapbox API token is not configured. Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable.');
        }
    }

    /**
     * Main geocoding method - searches by address or zipcode
     * @param query Address string or zipcode (e.g., "New York", "10001", "1600 Amphitheatre Parkway")
     * @param options Optional geocoding options
     * @returns Promise<GeocodingResult>
     */
    async geocode(query: string, options?: GeocodingOptions): Promise<GeocodingResult> {
        if (!query || !query.trim()) {
            return {
                success: false,
                error: 'Query cannot be empty'
            };
        }

        if (!this.apiToken) {
            return {
                success: false,
                error: 'Mapbox API token is not configured'
            };
        }

        try {
            const url = this.buildUrl(query, options);
            const response = await fetch(url);

            if (!response.ok) {
                return {
                    success: false,
                    error: `Mapbox API error: ${response.status} ${response.statusText}`
                };
            }

            const data: MapboxResponse = await response.json();

            if (!data.features || data.features.length === 0) {
                return {
                    success: false,
                    error: 'No results found for the given query'
                };
            }

            // Get the most relevant result (first one)
            const feature = data.features[0];
            return this.parseFeature(feature);

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Search by address string
     * @param address Address string (e.g., "New York", "123 Main St, Boston, MA")
     * @param options Optional geocoding options
     * @returns Promise<GeocodingResult>
     */
    async geocodeAddress(address: string, options?: GeocodingOptions): Promise<GeocodingResult> {
        const defaultOptions: GeocodingOptions = {
            types: ['address', 'place'],
            limit: 1,
            ...options
        };
        return this.geocode(address, defaultOptions);
    }

    /**
     * Search by zipcode/postal code
     * @param zipcode Zipcode/postal code (e.g., "10001", "90210")
     * @param options Optional geocoding options
     * @returns Promise<GeocodingResult>
     */
    async geocodeZipcode(zipcode: string, options?: GeocodingOptions): Promise<GeocodingResult> {
        const defaultOptions: GeocodingOptions = {
            types: ['postcode'],
            limit: 1,
            ...options
        };
        return this.geocode(zipcode, defaultOptions);
    }

    /**
     * Get multiple results for a query (useful for autocomplete)
     * @param query Search query
     * @param options Optional geocoding options
     * @returns Promise<GeocodingResult[]>
     */
    async geocodeMultiple(query: string, options?: GeocodingOptions): Promise<GeocodingResult[]> {
        if (!query || !query.trim()) {
            return [];
        }

        if (!this.apiToken) {
            return [];
        }

        try {
            const multiOptions = { ...options, limit: options?.limit || 5 };
            const url = this.buildUrl(query, multiOptions);
            const response = await fetch(url);

            if (!response.ok) {
                return [];
            }

            const data: MapboxResponse = await response.json();

            if (!data.features || data.features.length === 0) {
                return [];
            }

            return data.features.map(feature => this.parseFeature(feature));

        } catch (error) {
            console.error('Mapbox geocoding error:', error);
            return [];
        }
    }

    /**
     * Build the Mapbox API URL with query parameters
     * @private
     */
    private buildUrl(query: string, options?: GeocodingOptions): string {
        const params = new URLSearchParams();
        params.append('access_token', this.apiToken);

        if (options?.limit) {
            params.append('limit', options.limit.toString());
        }

        if (options?.country) {
            params.append('country', options.country);
        }

        if (options?.proximity) {
            params.append('proximity', options.proximity.join(','));
        }

        if (options?.types && options.types.length > 0) {
            params.append('types', options.types.join(','));
        }

        if (options?.language) {
            params.append('language', options.language);
        }

        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/${encodedQuery}.json?${params.toString()}`;
    }

    /**
     * Parse a Mapbox feature into a GeocodingResult
     * @private
     */
    private parseFeature(feature: MapboxFeature): GeocodingResult {
        const [longitude, latitude] = feature.center;
        
        // Extract address components from context
        let zipcode: string | undefined;
        let city: string | undefined;
        let state: string | undefined;
        let country: string | undefined;

        if (feature.context) {
            for (const ctx of feature.context) {
                if (ctx.id.startsWith('postcode')) {
                    zipcode = ctx.text;
                } else if (ctx.id.startsWith('place')) {
                    city = ctx.text;
                } else if (ctx.id.startsWith('region')) {
                    state = ctx.text;
                } else if (ctx.id.startsWith('country')) {
                    country = ctx.text;
                }
            }
        }

        // If the feature itself is a postcode, use it
        if (feature.place_type.includes('postcode')) {
            zipcode = feature.text;
        }

        // If the feature itself is a place (city), use it
        if (feature.place_type.includes('place') && !city) {
            city = feature.text;
        }

        return {
            success: true,
            latitude,
            longitude,
            address: feature.place_name,
            zipcode,
            city,
            state,
            country,
            placeId: feature.id,
            placeName: feature.place_name
        };
    }

    /**
     * Reverse geocoding - convert coordinates to address
     * @param longitude Longitude coordinate
     * @param latitude Latitude coordinate
     * @param options Optional geocoding options
     * @returns Promise<GeocodingResult>
     */
    async reverseGeocode(
        longitude: number,
        latitude: number,
        options?: GeocodingOptions
    ): Promise<GeocodingResult> {
        if (!this.apiToken) {
            return {
                success: false,
                error: 'Mapbox API token is not configured'
            };
        }

        try {
            const query = `${longitude},${latitude}`;
            const url = this.buildUrl(query, { ...options, limit: 1 });
            const response = await fetch(url);

            if (!response.ok) {
                return {
                    success: false,
                    error: `Mapbox API error: ${response.status} ${response.statusText}`
                };
            }

            const data: MapboxResponse = await response.json();

            if (!data.features || data.features.length === 0) {
                return {
                    success: false,
                    error: 'No address found for the given coordinates'
                };
            }

            const feature = data.features[0];
            return this.parseFeature(feature);

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Check if the service is properly configured
     */
    isConfigured(): boolean {
        return !!this.apiToken;
    }
}

// Export a singleton instance for convenience
export const mapboxGeocoding = new MapboxGeocodingService();

// Export the class as default
export default MapboxGeocodingService;
