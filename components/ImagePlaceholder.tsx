import React from 'react';

interface ImagePlaceholderProps {
    aspectRatio: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ aspectRatio }) => {
    const aspectRatioClass = {
        '1:1': 'aspect-square',
        '16:9': 'aspect-video',
        '9:16': 'aspect-[9/16]',
        '4:3': 'aspect-[4/3]',
        '3:4': 'aspect-[3/4]',
    }[aspectRatio] || 'aspect-video';

    return (
        <div className={`w-full bg-gray-700/50 rounded-lg animate-pulse ${aspectRatioClass}`}>
            <div className="flex items-center justify-center h-full">
                <svg className="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
    );
};

export default ImagePlaceholder;