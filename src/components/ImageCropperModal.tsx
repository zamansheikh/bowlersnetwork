'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { Area } from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    onCropComplete: (croppedBlob: Blob) => void;
    aspectRatio: number;
    title?: string;
}

export default function ImageCropperModal({ 
    isOpen, 
    onClose, 
    imageSrc, 
    onCropComplete, 
    aspectRatio,
    title = 'Crop Image'
}: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onRotationChange = (rotation: number) => {
        setRotation(rotation);
    };

    const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            if (imageSrc && croppedAreaPixels) {
                const croppedImage = await getCroppedImg(
                    imageSrc,
                    croppedAreaPixels,
                    rotation
                );
                if (croppedImage) {
                    onCropComplete(croppedImage);
                    onClose();
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden shadow-xl flex flex-col h-[600px] max-h-[90vh]">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative flex-1 bg-gray-900 w-full h-full"> 
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteCallback}
                        onZoomChange={onZoomChange}
                        onRotationChange={onRotationChange}
                    />
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3"/> Zoom</span>
                            <span>{Math.round((zoom - 1) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3"/> Rotate</span>
                            <span>{rotation}°</span>
                        </div>
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Use this photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
