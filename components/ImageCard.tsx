import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio, ASPECT_RATIOS } from '../constants';
import Spinner from './Spinner';
import SaveOptionsMenu from './SaveOptionsMenu';

interface ImageCardProps {
    src: string;
    index: number;
    aspectRatio: AspectRatio;
    processingAction: string | null;
    onEdit: (src: string) => void;
    onDescribe: (src: string, index: number) => void;
    onCaption: (src: string, index: number) => void;
    onRemoveText: (src: string, index: number) => void;
    onExpand: (src: string, index: number, ratio: AspectRatio) => void;
}

const ActionButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    children: React.ReactNode;
    title: string;
}> = ({ onClick, disabled, isLoading, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        title={title}
        className="flex-1 flex justify-center items-center p-2 bg-gray-700/50 hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors text-gray-300 hover:text-white"
    >
        {isLoading ? <Spinner /> : children}
    </button>
);

const ImageCard: React.FC<ImageCardProps> = ({ src, index, aspectRatio, processingAction, onEdit, onDescribe, onCaption, onRemoveText, onExpand }) => {
    const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
    const [showExpandMenu, setShowExpandMenu] = useState(false);
    const expandMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (expandMenuRef.current && !expandMenuRef.current.contains(event.target as Node)) {
                setShowExpandMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const aspectRatioClass = {
        '1:1': 'aspect-square',
        '16:9': 'aspect-video',
        '9:16': 'aspect-[9/16]',
        '4:3': 'aspect-[4/3]',
        '3:4': 'aspect-[3/4]',
    }[aspectRatio] || 'aspect-video';

    const isSquare = aspectRatio === '1:1';

    return (
        <>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg group">
                <div className={`relative ${aspectRatioClass}`}>
                    <img src={src} alt={`Generated image ${index + 1}`} className="w-full h-full object-contain" />
                </div>
                 <div className="p-2 bg-gray-900/50">
                    <div className="flex items-center justify-around gap-2">
                         <ActionButton onClick={() => setIsSaveMenuOpen(true)} title="Save Image">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" x2="12" y1="15" y2="3"/>
                            </svg>
                        </ActionButton>
                         <ActionButton onClick={() => onEdit(src)} title="Use as Reference">
                             <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                            </svg>
                        </ActionButton>
                        <ActionButton onClick={() => onDescribe(src, index)} isLoading={processingAction === `describe-${index}`} title="Describe Image (Generate Prompt)">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </ActionButton>
                        <ActionButton onClick={() => onCaption(src, index)} isLoading={processingAction === `caption-${index}`} title="Add Caption">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                <path d="m15 5 4 4"/>
                            </svg>
                        </ActionButton>
                        <ActionButton onClick={() => onRemoveText(src, index)} isLoading={processingAction === `remove-text-${index}`} title="Remove Text/Logos">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
                                <path d="M22 21H7"/>
                                <path d="m5 12 5 5"/>
                            </svg>
                        </ActionButton>
                         {isSquare && (
                            <div className="relative flex-1" ref={expandMenuRef}>
                                <ActionButton
                                    onClick={() => setShowExpandMenu(prev => !prev)}
                                    isLoading={processingAction === `expand-${index}`}
                                    title="Expand Image"
                                >
                                     <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14.5 9.5 21 3m0 0h-6m6 0v6M9.5 14.5 3 21m0 0h6m-6 0v-6"/>
                                    </svg>
                                </ActionButton>
                                {showExpandMenu && (
                                     <div className="absolute bottom-full right-0 mb-2 w-max bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 p-1">
                                        {ASPECT_RATIOS.map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => {
                                                    onExpand(src, index, ratio);
                                                    setShowExpandMenu(false);
                                                }}
                                                className="block w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-blue-600 hover:text-white rounded-sm transition-colors"
                                            >
                                                Expand to {ratio}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isSaveMenuOpen && (
                <SaveOptionsMenu
                    imageSrc={src}
                    fileName={`generated-image-${index + 1}.png`}
                    onClose={() => setIsSaveMenuOpen(false)}
                />
            )}
        </>
    );
};

export default ImageCard;