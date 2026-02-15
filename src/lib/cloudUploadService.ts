/**
 * Cloud Upload Service
 * 
 * A robust, reusable service for uploading files to cloud storage.
 * Provides progress tracking, speed monitoring, and error handling.
 * 
 * Usage:
 * ```typescript
 * const uploadService = new CloudUploadService();
 * 
 * const result = await uploadService.uploadFile(file, 'cdn', {
 *   onProgress: (progress) => console.log(`Progress: ${progress}%`),
 *   onSpeed: (speed) => console.log(`Speed: ${speed}`),
 *   onStatusChange: (status) => console.log(`Status: ${status}`)
 * });
 * 
 * if (result.success) {
 *   console.log('File URL:', result.publicUrl);
 * }
 * ```
 */

export interface UploadCallbacks {
    /** Called when upload progress changes (0-100) */
    onProgress?: (progress: number) => void;
    
    /** Called when upload speed changes (e.g., "2.5 Mbps") */
    onSpeed?: (speed: string) => void;
    
    /** Called when upload status changes */
    onStatusChange?: (status: 'idle' | 'initiating' | 'uploading' | 'saving' | 'success' | 'error' | 'aborted') => void;
    
    /** Called when an error occurs */
    onError?: (error: string) => void;
    
    /** Called when upload is complete successfully */
    onSuccess?: (publicUrl: string, key: string) => void;
}

export interface UploadResult {
    /** Whether the upload was successful */
    success: boolean;
    
    /** Public URL of the uploaded file (if successful) */
    publicUrl?: string;
    
    /** Cloud storage key/path of the uploaded file (if successful) */
    key?: string;
    
    /** Error message (if failed) */
    error?: string;
    
    /** Whether the upload was aborted by user */
    aborted?: boolean;
}

export interface UploadOptions {
    /** Custom file name (optional, defaults to original file name) */
    fileName?: string;
    
    /** Custom headers to include in API requests (optional) */
    customHeaders?: Record<string, string>;
    
    /** Whether to automatically get auth token from localStorage (default: true) */
    useAuth?: boolean;
}

export class CloudUploadService {
    private abortController: AbortController | null = null;
    private uploadInfo: { key: string; publicUrl: string } | null = null;
    private callbacks: UploadCallbacks = {};

    /**
     * Upload a file to cloud storage
     * 
     * @param file - The file to upload
     * @param bucketName - The cloud bucket name (e.g., 'cdn')
     * @param callbacks - Optional callbacks for progress, speed, and status updates
     * @param options - Optional upload configuration
     * @returns Promise with upload result containing success status and public URL
     */
    async uploadFile(
        file: File,
        bucketName: string,
        callbacks?: UploadCallbacks,
        options?: UploadOptions
    ): Promise<UploadResult> {
        this.callbacks = callbacks || {};
        this.abortController = new AbortController();

        try {
            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            // Update status to initiating
            this.updateStatus('initiating');

            // Step 1: Get presigned URL
            const { key, publicUrl, presignedUrl } = await this.initiateUpload(
                file,
                bucketName,
                options
            );

            this.uploadInfo = { key, publicUrl };

            // Step 2: Upload file with progress tracking
            this.updateStatus('uploading');
            await this.uploadWithProgress(file, presignedUrl);

            // Step 3: Success
            this.updateStatus('success');
            this.callbacks.onSuccess?.(publicUrl, key);

            return {
                success: true,
                publicUrl,
                key,
            };
        } catch (error: any) {
            // Handle abort
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                this.updateStatus('aborted');
                return {
                    success: false,
                    error: 'Upload cancelled by user',
                    aborted: true,
                };
            }

            // Handle other errors
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            this.updateStatus('error');
            this.callbacks.onError?.(errorMessage);

            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            this.cleanup();
        }
    }

    /**
     * Abort the current upload
     */
    async abort(): Promise<void> {
        if (!this.abortController) {
            return;
        }

        // Abort the upload request
        this.abortController.abort();

        // If upload has been initiated, notify server to cleanup
        if (this.uploadInfo) {
            try {
                const token = localStorage.getItem('access_token');
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                await fetch('/api/cloud/upload/singlepart/requests/abort', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        bucket: 'cdn',
                        params: {
                            key: this.uploadInfo.key
                        }
                    })
                });
                console.log('[CloudUploadService] Upload aborted on server');
            } catch (error) {
                console.error('[CloudUploadService] Failed to abort upload on server:', error);
            }
        }
    }

    /**
     * Check if an upload is currently in progress
     */
    isUploading(): boolean {
        return this.abortController !== null;
    }

    // Private methods

    private async initiateUpload(
        file: File,
        bucketName: string,
        options?: UploadOptions
    ): Promise<{ key: string; publicUrl: string; presignedUrl: string }> {
        const useAuth = options?.useAuth !== false;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options?.customHeaders,
        };

        if (useAuth) {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const fileName = options?.fileName || file.name;

        const response = await fetch('/api/cloud/upload/singlepart/requests/initiate', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                bucket: bucketName,
                file_name: fileName
            }),
            signal: this.abortController!.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0] || `Failed to initiate upload: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            key: data.key,
            publicUrl: data.public_url,
            presignedUrl: data.presigned_url,
        };
    }

    private uploadWithProgress(file: File, presignedUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let lastLoaded = 0;
            let lastSpeedCalculationTime = Date.now();
            let currentLoaded = 0;
            let speedUpdateInterval: NodeJS.Timeout | null = null;

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    currentLoaded = e.loaded;
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    this.callbacks.onProgress?.(percentComplete);
                }
            });

            // Calculate speed every 1 second
            speedUpdateInterval = setInterval(() => {
                const currentTime = Date.now();
                const timeElapsedSeconds = (currentTime - lastSpeedCalculationTime) / 1000;
                const bytesTransferred = Math.max(0, currentLoaded - lastLoaded);

                const bytesPerSecond = bytesTransferred / Math.max(timeElapsedSeconds, 1);
                const speed = this.formatSpeed(bytesPerSecond);

                this.callbacks.onSpeed?.(speed);

                lastLoaded = currentLoaded;
                lastSpeedCalculationTime = currentTime;
            }, 1000);

            // Handle completion
            xhr.addEventListener('load', () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
                }
            });

            // Handle errors
            xhr.addEventListener('error', () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                reject(new Error('Upload failed: Network error'));
            });

            // Handle abort
            xhr.addEventListener('abort', () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                reject(new Error('Upload aborted'));
            });

            // Set up abort signal
            const abortHandler = () => {
                if (speedUpdateInterval) clearInterval(speedUpdateInterval);
                xhr.abort();
            };
            this.abortController?.signal.addEventListener('abort', abortHandler);

            // Start upload
            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.send(file);
        });
    }

    private formatSpeed(bytesPerSecond: number): string {
        const bitsPerSecond = bytesPerSecond * 8;
        
        if (bitsPerSecond >= 1_000_000_000) {
            return (bitsPerSecond / 1_000_000_000).toFixed(2) + ' Gbps';
        } else if (bitsPerSecond >= 1_000_000) {
            return (bitsPerSecond / 1_000_000).toFixed(2) + ' Mbps';
        } else if (bitsPerSecond >= 1_000) {
            return (bitsPerSecond / 1_000).toFixed(2) + ' Kbps';
        } else {
            return Math.round(bitsPerSecond) + ' bps';
        }
    }

    private updateStatus(status: 'idle' | 'initiating' | 'uploading' | 'saving' | 'success' | 'error' | 'aborted') {
        this.callbacks.onStatusChange?.(status);
    }

    private cleanup() {
        this.abortController = null;
        this.uploadInfo = null;
    }
}

// Export singleton instance for convenience
export const cloudUploadService = new CloudUploadService();

// Export helper function for quick uploads
export async function uploadFileToCloud(
    file: File,
    bucketName: string = 'cdn',
    callbacks?: UploadCallbacks,
    options?: UploadOptions
): Promise<UploadResult> {
    const service = new CloudUploadService();
    return service.uploadFile(file, bucketName, callbacks, options);
}
