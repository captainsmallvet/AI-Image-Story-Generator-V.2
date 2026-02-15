
import React, { useState, useRef, useEffect } from 'react';
import Spinner from './Spinner';
import { ASPECT_RATIOS, AspectRatio } from '../constants';

interface PromptActionsProps {
    prompt: string;
    hasReferenceImage: boolean;
    onCopy: () => void;
    onClear: () => void;
    onDescribe: () => void;
    onCaption: () => void;
    onRemoveText: () => void;
    onExpand: (ratio: AspectRatio) => void;
    onEnhance: () => void;
    onConcept: () => void;
    loadingAction: string | null;
}

const ActionButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    children: React.ReactNode;
    title: string;
    className?: string;
}> = ({ onClick, disabled, isLoading, children, title, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        title={title}
        className={`flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-500 text-sm text-gray-300 hover:text-white rounded-md transition-all ${className}`}
    >
        {isLoading ? <Spinner /> : children}
    </button>
);


const PromptActions: React.FC<PromptActionsProps> = ({
    prompt,
    hasReferenceImage,
    onCopy,
    onClear,
    onDescribe,
    onCaption,
    onRemoveText,
    onExpand,
    onEnhance,
    onConcept,
    loadingAction,
}) => {
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

    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
            <ActionButton
                onClick={onCopy}
                disabled={!prompt}
                title="Copy prompt to clipboard"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copy
            </ActionButton>
            <ActionButton
                onClick={onClear}
                disabled={!prompt}
                title="Clear prompt"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                Clear
            </ActionButton>
            <ActionButton
                onClick={onDescribe}
                disabled={!hasReferenceImage}
                isLoading={loadingAction === 'describe-ref-1'}
                title="Describe ref-1 to generate a prompt"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Describe Image
            </ActionButton>
             <ActionButton
                onClick={onCaption}
                disabled={!hasReferenceImage}
                isLoading={loadingAction === 'caption-ref-1'}
                title="Suggest a caption for ref-1 and create a prompt"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                Caption
            </ActionButton>
            <ActionButton
                onClick={onRemoveText}
                disabled={!hasReferenceImage}
                isLoading={loadingAction === 'remove-text-ref-1'}
                title="Remove text from ref-1 and generate"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 12 5 5"/></svg>
                Remove Text
            </ActionButton>
            <div className="relative" ref={expandMenuRef}>
                 <ActionButton
                    onClick={() => setShowExpandMenu(prev => !prev)}
                    disabled={!hasReferenceImage}
                    isLoading={loadingAction === 'expand-ref-1'}
                    title="Expand ref-1 to a new aspect ratio"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 9.5 21 3m0 0h-6m6 0v6M9.5 14.5 3 21m0 0h6m-6 0v-6"/></svg>
                    Expand
                </ActionButton>
                {showExpandMenu && (
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 p-1">
                        {ASPECT_RATIOS.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => {
                                    onExpand(ratio);
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
             <ActionButton
                onClick={onEnhance}
                disabled={!prompt}
                isLoading={loadingAction === 'enhance'}
                title="Enhance the current prompt with more detail"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z"/></svg>
                Enhance Prompt
            </ActionButton>
             <ActionButton
                onClick={onConcept}
                disabled={!prompt}
                isLoading={loadingAction === 'concept'}
                title="Generate an image concept from your story"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                Concept
            </ActionButton>

            {/* External Tool Buttons */}
            <ActionButton
                onClick={() => openLink('https://labs.google/fx/th/tools/flow')}
                title="Open Google Labs Flow"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/></svg>
                Flow
            </ActionButton>

             <ActionButton
                onClick={() => openLink('https://labs.google/fx/th/tools/whisk')}
                title="Open Google Labs Whisk"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                Whisk
            </ActionButton>

             <ActionButton
                onClick={() => openLink('https://labs.google')}
                title="Open Google Labs"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
                Lab
            </ActionButton>

            <ActionButton
                onClick={() => openLink('https://gemini.google.com/')}
                title="Open Google Gemini"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Gemini
            </ActionButton>
        </div>
    );
};

export default PromptActions;
