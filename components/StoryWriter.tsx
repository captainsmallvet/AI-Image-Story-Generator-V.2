
import React, { useState, useRef } from 'react';
import { STORY_LANGUAGES, STORY_STYLES, IMAGE_STYLES, StoryLanguageKey, StoryStyleKey, ImageStyleKey, ReasoningModelKey } from '../constants';
import { generateNextSentence, generateStoryCaption, polishStory, translateStory, generateDesignFromStory } from '../services/geminiService';
import Spinner from './Spinner';

interface StoryWriterProps {
    onPostToPrompt: (storyText: string) => void;
    selectedStyle: ImageStyleKey;
    selectedReasoningModel: ReasoningModelKey;
    maxCaptionLength: number;
    onMaxCaptionLengthChange: (length: number) => void;
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

const StoryWriter: React.FC<StoryWriterProps> = ({ 
    onPostToPrompt, 
    selectedStyle, 
    selectedReasoningModel,
    maxCaptionLength,
    onMaxCaptionLengthChange
}) => {
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
            const nextSentence = await generateNextSentence(story, language, style, selectedReasoningModel);
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
            const caption = await generateStoryCaption(story, selectedReasoningModel, 'English', maxCaptionLength);
            const fullPrompt = `Recreate the image in [ref-1], but add the following text as a caption: "${caption}". The text should be elegantly placed in a suitable position, using a beautiful font with a color that is easily readable against the background. Do not obscure important details like faces or key subjects. The text should be clear and readable on a mobile screen. Use the exact text provided without translation.`;
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
            const caption = await generateStoryCaption(story, selectedReasoningModel, 'Thai', maxCaptionLength);
            const fullPrompt = `Recreate the image in [ref-1], but add the following Thai text as a caption: "${caption}". The Thai text should be elegantly placed in a suitable position, using a beautiful font with a color that is easily readable against the background. Do not obscure important details like faces or key subjects. The Thai text MUST be rendered exactly as written in Thai characters, without any translation to English.`;
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
                generateStoryCaption(story, selectedReasoningModel, 'Thai', maxCaptionLength),
                generateDesignFromStory(story, styleName, selectedReasoningModel)
            ]);
            
            const fullPrompt = `${designPrompt} Thai text in the image: "${caption}". The Thai text should be elegantly placed in a suitable position, using a beautiful font with a color that is easily readable against the background. Do not obscure important details like faces or key subjects. The Thai text MUST be rendered exactly as written in Thai characters, without any translation to English.`;
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
            const polishedStory = await polishStory(story, selectedReasoningModel);
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
            const translatedStory = await translateStory(story, targetLanguage, selectedReasoningModel);
            onPostToPrompt(translatedStory);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingAction(null);
        }
    };


    return (
        <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-center mb-4 text-gray-200 flex items-center justify-center gap-2">
                 <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                 Story Writer
            </h3>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {showFileOptions && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 space-y-3 border border-gray-700 shadow-2xl">
                         <h4 className="text-lg font-semibold text-white">How to open file?</h4>
                         <button onClick={() => handleFileOpen('overwrite')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors">เขียนทับข้อมูลเดิม</button>
                         <button onClick={() => handleFileOpen('insert')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors">เขียนแทรกข้อมูลเดิม</button>
                         <button onClick={() => handleFileOpen('append')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors">เขียนต่อท้ายข้อมูลเดิม</button>
                         <button onClick={() => setShowFileOptions(false)} className="mt-2 w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded-md text-center transition-colors">Cancel</button>
                    </div>
                 </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm font-medium">Open</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt" />
                
                <input 
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-grow bg-gray-900 border border-gray-700 text-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm px-3"
                    placeholder="story.txt"
                />

                <button onClick={handleSaveFile} className="flex-1 text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm font-medium">Save</button>
            </div>

            <textarea
                ref={textareaRef}
                rows={10}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600 resize-y p-3 transition-all"
                placeholder="Write your story here..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                disabled={!!loadingAction}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-4">
                <div>
                    <label htmlFor="language" className="block text-xs font-medium text-gray-400 mb-1">ภาษา</label>
                    <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as StoryLanguageKey)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        {STORY_LANGUAGES.map(lang => <option key={lang.key} value={lang.key}>{lang.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="style" className="block text-xs font-medium text-gray-400 mb-1">สไตล์การเล่าเรื่อง</label>
                    <select id="style" value={style} onChange={(e) => setStyle(e.target.value as StoryStyleKey)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        {STORY_STYLES.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Max Caption Length Setting */}
            <div className="mb-4 flex flex-col items-center">
                 <label htmlFor="maxCaptionLength" className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                    Max Caption Length (Characters)
                 </label>
                 <input 
                    type="number"
                    id="maxCaptionLength"
                    value={maxCaptionLength}
                    onChange={(e) => onMaxCaptionLengthChange(parseInt(e.target.value) || 0)}
                    className="w-24 bg-gray-900 border border-gray-700 text-center text-blue-400 font-bold rounded-md py-1.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                 />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <ActionButton onClick={handleIdea} isLoading={loadingAction === 'idea'} title="Generate the next sentence" className="bg-green-600 hover:bg-green-700 text-white font-bold">Idea</ActionButton>
                <ActionButton onClick={handleCustomCaption} isLoading={loadingAction === 'caption'} disabled={!story} title="Create an English caption for your story">Custom Caption</ActionButton>
                <ActionButton onClick={handleThaiCaption} isLoading={loadingAction === 'caption-thai'} disabled={!story} title="Create a Thai caption for your story">Thai Caption</ActionButton>
                <ActionButton onClick={handleNewThaiCaption} isLoading={loadingAction === 'new-caption-thai'} disabled={!story} title="New image with Thai caption based on story" className="bg-indigo-600 hover:bg-indigo-700 text-white">New Thai Caption</ActionButton>
                <ActionButton onClick={handlePolish} isLoading={loadingAction === 'polish'} disabled={!story} title="Rewrite the story professionally">Polish</ActionButton>
                <ActionButton onClick={handlePost} disabled={!story} title="Post story to main prompt" className="bg-blue-600 hover:bg-blue-500">Post</ActionButton>
                <ActionButton onClick={() => handleTranslate('Thai')} isLoading={loadingAction === 'translate-thai'} disabled={!story} title="Translate story to Thai and post to prompt">Thai</ActionButton>
                <ActionButton onClick={() => handleTranslate('English')} isLoading={loadingAction === 'translate-english'} disabled={!story} title="Translate story to English and post to prompt">English</ActionButton>
                <ActionButton onClick={handleCopy} disabled={!story} title="Copy story to clipboard">Copy</ActionButton>
                <ActionButton onClick={handleClear} disabled={!story} title="Clear story text">Clear</ActionButton>
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                    * ทิป: เลือกสมอง (Reasoning Model) เป็น <span className="text-blue-400">Flash</span> เพื่อประหยัดโควต้า หรือ <span className="text-indigo-400">Pro</span> เพื่อความลุ่มลึกในการต่อเนื้อเรื่อง
                </p>
            </div>
        </div>
    );
};

export default StoryWriter;
