
import React, { useState, useRef } from 'react';
import { STORY_LANGUAGES, STORY_STYLES, IMAGE_STYLES, StoryLanguageKey, StoryStyleKey, ImageStyleKey } from '../constants';
import { generateNextSentence, generateStoryCaption, polishStory, translateStory, generateDesignFromStory } from '../services/geminiService';
import Spinner from './Spinner';

interface StoryWriterProps {
    onPostToPrompt: (storyText: string) => void;
    selectedStyle: ImageStyleKey;
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

const StoryWriter: React.FC<StoryWriterProps> = ({ onPostToPrompt, selectedStyle }) => {
    const [story, setStory] = useState('');
    const [fileName, setFileName] = useState('story.txt');
    const [language, setLanguage] = useState<StoryLanguageKey>('thai');
    const [style, setStyle] = useState<StoryStyleKey>('unspecified');
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [showFileOptions, setShowFileOptions] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setFileContent(text);
                setShowFileOptions(true);
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    };
    
    const handleFileOpen = (mode: 'overwrite' | 'insert' | 'append') => {
        if (!fileContent) return;

        if (mode === 'overwrite') {
            setStory(fileContent);
             if (fileInputRef.current?.files?.[0]) {
                setFileName(fileInputRef.current.files[0].name);
            }
        } else if (mode === 'append') {
            setStory(prev => (prev ? prev + '\n' : '') + fileContent);
        } else if (mode === 'insert' && textareaRef.current) {
            const { selectionStart, value } = textareaRef.current;
            const newStory = value.slice(0, selectionStart) + fileContent + value.slice(selectionStart);
            setStory(newStory);
        }
        setShowFileOptions(false);
        setFileContent(null);
    };

    const handleSaveFile = () => {
        if (!story) {
            setError("There is no story to save.");
            return;
        }
        setError(null);
        const blob = new Blob([story], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const handleClear = () => setStory('');
    const handleCopy = () => navigator.clipboard.writeText(story);
    const handlePost = () => onPostToPrompt(story);
    
    const handleIdea = async () => {
        setLoadingAction('idea');
        setError(null);
        try {
            const nextSentence = await generateNextSentence(story, language, style);
            if (style === 'thai_poem') {
                setStory(prev => (prev.trim() ? prev.trim() + '\n' + nextSentence : nextSentence));
            } else {
                setStory(prev => (prev.trim() ? prev.trim() + ' ' + nextSentence : nextSentence));
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingAction(null);
        }
    };
    
    const handleCustomCaption = async () => {
        if (!story.trim()) {
            setError("Story is empty. Cannot create a caption.");
            return;
        }
        setLoadingAction('caption');
        setError(null);
        try {
            const caption = await generateStoryCaption(story, 'English');
            const fullPrompt = `Recreate the image in [ref-1], but add the following text as a caption: "${caption}". The caption should be elegantly placed in a suitable position, using a beautiful font with a color that is easily readable against the background. Do not obscure important details like faces or key subjects. The text should be clear and readable on a mobile screen.`;
            onPostToPrompt(fullPrompt);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleThaiCaption = async () => {
        if (!story.trim()) {
            setError("Story is empty. Cannot create a caption.");
            return;
        }
        setLoadingAction('caption-thai');
        setError(null);
        try {
            const caption = await generateStoryCaption(story, 'Thai');
            const fullPrompt = `Recreate the image in [ref-1], but add the following text as a caption: "${caption}". The caption should be elegantly placed in a suitable position, using a beautiful font with a color that is easily readable against the background. Do not obscure important details like faces or key subjects. The text should be clear and readable on a mobile screen.`;
            onPostToPrompt(fullPrompt);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleNewThaiCaption = async () => {
        if (!story.trim()) {
            setError("Story is empty. Cannot create a caption.");
            return;
        }
        setLoadingAction('new-caption-thai');
        setError(null);
        try {
            const styleName = IMAGE_STYLES.find(s => s.key === selectedStyle)?.name || 'Photorealistic';
            
            const [caption, designPrompt] = await Promise.all([
                generateStoryCaption(story, 'Thai'),
                generateDesignFromStory(story, styleName)
            ]);
            
            const fullPrompt = `${designPrompt} Text in the image: "${caption}". The caption should be elegantly placed in a suitable position, using a beautiful font with a color that is easily readable against the background. Do not obscure important details like faces or key subjects. The text should be clear and readable on a mobile screen.`;
            onPostToPrompt(fullPrompt);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingAction(null);
        }
    };
    
    const handlePolish = async () => {
        if (!story.trim()) {
            setError("Story is empty. Nothing to polish.");
            return;
        }
        setLoadingAction('polish');
        setError(null);
        try {
            const polishedStory = await polishStory(story);
            onPostToPrompt(polishedStory);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleTranslate = async (targetLanguage: 'Thai' | 'English') => {
        if (!story.trim()) {
            setError(`Story is empty. Nothing to translate to ${targetLanguage}.`);
            return;
        }
        const actionKey = `translate-${targetLanguage.toLowerCase()}`;
        setLoadingAction(actionKey);
        setError(null);
        try {
            const translatedStory = await translateStory(story, targetLanguage);
            onPostToPrompt(translatedStory);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingAction(null);
        }
    };


    return (
        <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-center mb-4 text-gray-200">Story Writer</h3>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {showFileOptions && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 space-y-3">
                         <h4 className="text-lg font-semibold text-white">How to open file?</h4>
                         <button onClick={() => handleFileOpen('overwrite')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md">เขียนทับข้อมูลเดิม</button>
                         <button onClick={() => handleFileOpen('insert')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md">เขียนแทรกข้อมูลเดิม</button>
                         <button onClick={() => handleFileOpen('append')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md">เขียนต่อท้ายข้อมูลเดิม</button>
                         <button onClick={() => setShowFileOptions(false)} className="mt-2 w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded-md text-center">Cancel</button>
                    </div>
                 </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm">Open</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt" />
                
                <input 
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-grow bg-gray-900 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3"
                    placeholder="story.txt"
                />

                <button onClick={handleSaveFile} className="flex-1 text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm">Save</button>
            </div>

            <textarea
                ref={textareaRef}
                rows={10}
                className="w-full bg-gray-900 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-y"
                placeholder="Write your story here..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                disabled={!!loadingAction}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-4">
                <div>
                    <label htmlFor="language" className="block text-xs font-medium text-gray-400 mb-1">ภาษา</label>
                    <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as StoryLanguageKey)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                        {STORY_LANGUAGES.map(lang => <option key={lang.key} value={lang.key}>{lang.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="style" className="block text-xs font-medium text-gray-400 mb-1">สไตล์การเล่าเรื่อง</label>
                    <select id="style" value={style} onChange={(e) => setStyle(e.target.value as StoryStyleKey)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                        {STORY_STYLES.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <ActionButton onClick={handleIdea} isLoading={loadingAction === 'idea'} title="Generate the next sentence" className="bg-green-600 hover:bg-green-700">Idea</ActionButton>
                <ActionButton onClick={handleCustomCaption} isLoading={loadingAction === 'caption'} disabled={!story} title="Create an English caption for your story">Custom Caption</ActionButton>
                <ActionButton onClick={handleThaiCaption} isLoading={loadingAction === 'caption-thai'} disabled={!story} title="Create a Thai caption for your story">Thai Caption</ActionButton>
                <ActionButton onClick={handleNewThaiCaption} isLoading={loadingAction === 'new-caption-thai'} disabled={!story} title="New image with Thai caption based on story">New Thai Caption</ActionButton>
                <ActionButton onClick={handlePolish} isLoading={loadingAction === 'polish'} disabled={!story} title="Rewrite the story professionally">Polish</ActionButton>
                <ActionButton onClick={handlePost} disabled={!story} title="Post story to main prompt">Post</ActionButton>
                <ActionButton onClick={() => handleTranslate('Thai')} isLoading={loadingAction === 'translate-thai'} disabled={!story} title="Translate story to Thai and post to prompt">Thai</ActionButton>
                <ActionButton onClick={() => handleTranslate('English')} isLoading={loadingAction === 'translate-english'} disabled={!story} title="Translate story to English and post to prompt">English</ActionButton>
                <ActionButton onClick={handleCopy} disabled={!story} title="Copy story to clipboard">Copy</ActionButton>
                <ActionButton onClick={handleClear} disabled={!story} title="Clear story text">Clear</ActionButton>
            </div>
        </div>
    );
};

export default StoryWriter;
