import React, { useRef } from 'react';

interface ReferenceImagesProps {
    images: string[];
    onRemove: (index: number) => void;
    onUpload: (file: File) => void;
    onInsertTag: (tag: string) => void;
}

const ReferenceImages: React.FC<ReferenceImagesProps> = ({ images, onRemove, onUpload, onInsertTag }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        // Reset the input value to allow uploading the same file again
        event.target.value = '';
    };

    if (images.length === 0) {
         return (
             <div className="mb-4">
                 <button 
                     type="button"
                     onClick={handleUploadClick}
                     className="w-full text-center py-3 px-4 border-2 border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                 >
                     + Upload a Reference Image
                 </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                 />
             </div>
         );
    }

    return (
        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Reference Images ({images.length}/4)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((src, index) => (
                    <div 
                        key={index} 
                        className="relative group rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        tabIndex={0}
                    >
                        <img src={src} alt={`Reference ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col items-center justify-between p-1 rounded-md">
                            <button
                                onClick={() => onInsertTag(`[ref-${index + 1}]`)}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                            >
                                Use [ref-{index+1}]
                            </button>
                            <button
                                onClick={() => onRemove(index)}
                                className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                 {images.length < 4 && (
                    <button 
                        type="button"
                        onClick={handleUploadClick}
                        className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                 )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
};

export default ReferenceImages;