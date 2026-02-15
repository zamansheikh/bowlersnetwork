/**
 * React Hook for Cloud Upload
 * 
 * A React hook that provides a simple interface for uploading files to cloud storage.
 * Manages upload state, progress, and provides methods to start, abort uploads.
 * 
 * Usage:
 * ```typescript
 * function MyComponent() {
 *   const { uploadFile, abort, state, progress, speed } = useCloudUpload();
 * 
 *   const handleUpload = async (file: File) => {
 *     const result = await uploadFile(file, 'cdn');
 *     if (result.success) {
 *       console.log('Uploaded:', result.publicUrl);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
 *       {state === 'uploading' && <p>Progress: {progress}% - {speed}</p>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useRef } from 'react';
import { CloudUploadService, UploadResult, UploadOptions } from './cloudUploadService';

export type UploadState = 'idle' | 'initiating' | 'uploading' | 'saving' | 'success' | 'error' | 'aborted';

export interface UseCloudUploadReturn {
    /** Upload a file to cloud storage */
    uploadFile: (file: File, bucketName?: string, options?: UploadOptions) => Promise<UploadResult>;
    
    /** Abort the current upload */
    abort: () => Promise<void>;
    
    /** Reset upload state */
    reset: () => void;
    
    /** Current upload state */
    state: UploadState;
    
    /** Upload progress (0-100) */
    progress: number;
    
    /** Upload speed (e.g., "2.5 Mbps") */
    speed: string;
    
    /** Error message if upload failed */
    error: string | null;
    
    /** Public URL of uploaded file (if successful) */
    publicUrl: string | null;
    
    /** Cloud storage key (if successful) */
    key: string | null;
    
    /** Whether an upload is currently in progress */
    isUploading: boolean;
}

export function useCloudUpload(): UseCloudUploadReturn {
    const [state, setState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState('0 Kbps');
    const [error, setError] = useState<string | null>(null);
    const [publicUrl, setPublicUrl] = useState<string | null>(null);
    const [key, setKey] = useState<string | null>(null);
    
    const serviceRef = useRef<CloudUploadService | null>(null);

    const uploadFile = useCallback(async (
        file: File,
        bucketName: string = 'cdn',
        options?: UploadOptions
    ): Promise<UploadResult> => {
        // Create new service instance
        const service = new CloudUploadService();
        serviceRef.current = service;

        // Reset state
        setState('idle');
        setProgress(0);
        setSpeed('0 Kbps');
        setError(null);
        setPublicUrl(null);
        setKey(null);

        // Start upload with callbacks
        const result = await service.uploadFile(file, bucketName, {
            onProgress: (p) => setProgress(p),
            onSpeed: (s) => setSpeed(s),
            onStatusChange: (status) => setState(status),
            onError: (err) => setError(err),
            onSuccess: (url, k) => {
                setPublicUrl(url);
                setKey(k);
            },
        }, options);

        return result;
    }, []);

    const abort = useCallback(async () => {
        if (serviceRef.current) {
            await serviceRef.current.abort();
        }
    }, []);

    const reset = useCallback(() => {
        setState('idle');
        setProgress(0);
        setSpeed('0 Kbps');
        setError(null);
        setPublicUrl(null);
        setKey(null);
        serviceRef.current = null;
    }, []);

    return {
        uploadFile,
        abort,
        reset,
        state,
        progress,
        speed,
        error,
        publicUrl,
        key,
        isUploading: state === 'uploading' || state === 'initiating' || state === 'saving',
    };
}
