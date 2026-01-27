import React, { useState, useEffect, useCallback } from 'react';
import { getResizedImageBlob, downloadResizedImage } from '../utils/imageUtils';
import Spinner from './Spinner';

interface SaveOption {
    quality: number;
    scale: number;
    width: number;
    height: number;
    size: number; // in bytes
}

interface SaveOptionsMenuProps {
    imageSrc: string;
    fileName: string;
    onClose: () => void;
}

const QUALITIES = [100, 90, 80, 70, 60, 50];

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const SaveOptionsMenu: React.FC<SaveOptionsMenuProps> = ({ imageSrc, fileName, onClose }) => {
    const [options, setOptions] = useState<SaveOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState<number | null>(null);

    const calculateOptions = useCallback(async () => {
        setIsLoading(true);
        const img = new Image();
        img.onload = async () => {
            const calculatedOptions: SaveOption[] = [];
            for (const quality of QUALITIES) {
                const scale = quality / 100;
                try {
                    const blob = await getResizedImageBlob(imageSrc, scale);
                    if (blob) {
                        calculatedOptions.push({
                            quality,
                            scale,
                            width: Math.round(img.width * scale),
                            height: Math.round(img.height * scale),
                            size: blob.size,
                        });
                    }
                } catch (error) {
                    console.error(`Failed to calculate size for ${quality}%`, error);
                }
            }
            setOptions(calculatedOptions);
            setIsLoading(false);
        };
        img.src = imageSrc;
    }, [imageSrc]);

    useEffect(() => {
        calculateOptions();
    }, [calculateOptions]);
    
    const handleDownloadClick = async (option: SaveOption) => {
        setIsDownloading(option.quality);
        await downloadResizedImage(imageSrc, fileName, option.scale);
        setIsDownloading(null);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-options-title"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 id="save-options-title" className="text-xl font-semibold text-white">Select Download Size</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Spinner />
                        <p className="mt-4 text-gray-400">Calculating image sizes...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {options.map((opt) => (
                            <button
                                key={opt.quality}
                                onClick={() => handleDownloadClick(opt)}
                                disabled={isDownloading !== null}
                                className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors flex justify-between items-center disabled:opacity-50 disabled:cursor-wait"
                            >
                                <div className="flex items-center">
                                    {isDownloading === opt.quality ? <Spinner /> : 
                                    <div className="font-bold text-white w-8 text-right mr-2">{opt.quality}%</div>}
                                    <span className="text-gray-400 ml-2">({opt.width}x{opt.height}px)</span>
                                </div>
                                <span className="text-sm text-gray-300">about {formatBytes(opt.size)}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaveOptionsMenu;
