
// Implement dynamic API key support for standalone deployments
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { STYLE_PROMPT_PREFIXES, ImageStyleKey, ImageModelKey, AspectRatio, StoryLanguageKey, StoryStyleKey, ReasoningModelKey } from "../constants";

// Internal tracker for the active API Key
let currentActiveApiKey = process.env.API_KEY || '';

/**
 * Updates the API key used for all services.
 * Prioritizes keys from the UI notepad.
 */
export const updateActiveApiKey = (key: string) => {
    if (key && key !== 'no API key' && key.trim().length > 0) {
        currentActiveApiKey = key.trim();
    } else {
        currentActiveApiKey = process.env.API_KEY || '';
    }
};

/**
 * Internal helper to get a fresh AI client with the most up-to-date key
 */
const getAi = () => {
    return new GoogleGenAI({ apiKey: currentActiveApiKey });
};

// Helper to parse base64 data URL
const parseDataUrl = (dataUrl: string): { mimeType: string, data: string } => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    return { mimeType, data };
};

export const generateFromText = async (
    prompt: string,
    count: 1 | 4,
    aspectRatio: AspectRatio,
    style: ImageStyleKey,
    model: ImageModelKey
): Promise<string[]> => {
    const ai = getAi();
    const fullPrompt = `${STYLE_PROMPT_PREFIXES[style]} ${prompt}`;

    if (model === 'imagen-4.0-generate-001') {
        const response = await ai.models.generateImages({
            model,
            prompt: fullPrompt,
            config: {
                numberOfImages: count,
                aspectRatio,
                outputMimeType: 'image/png',
            },
        });
        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } else if (model.includes('gemini') || model.includes('flash') || model.includes('pro')) {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: fullPrompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                }
            },
        });
        
        const images: string[] = [];
        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData) {
                images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
        if (images.length === 0) {
            throw new Error(`Generation failed. Ensure your API Key is valid and the model supports image generation.`);
        }
        return images;
    }

    throw new Error(`Unsupported model: ${model}`);
};

export const generateFromImageAndText = async (prompt: string, referenceImages: string[]): Promise<string[]> => {
    const ai = getAi();
    const parts: Part[] = [];

    for (const refImage of referenceImages) {
        const { mimeType, data } = parseDataUrl(refImage);
        parts.push({ inlineData: { mimeType, data } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
    });

    const images: string[] = [];
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
    }
    if (images.length === 0) {
        throw new Error("Generation failed. No image returned.");
    }
    return images;
};

export const describeImage = async (imageSrc: string, model: ReasoningModelKey = 'gemini-3-flash-preview'): Promise<string> => {
    const ai = getAi();
    const { mimeType, data } = parseDataUrl(imageSrc);
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { mimeType, data } },
                { text: "Describe this image in detail. Focus on creating a descriptive prompt that could be used for a text-to-image AI." }
            ]
        },
    });
    return response.text || "";
};

export const suggestCaption = async (imageSrc: string, model: ReasoningModelKey = 'gemini-3-flash-preview'): Promise<string> => {
    const ai = getAi();
    const { mimeType, data } = parseDataUrl(imageSrc);
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { mimeType, data } },
                { text: "Suggest a short, witty, and engaging caption for this image suitable for social media. Respond with only the caption text." }
            ]
        },
    });
    return (response.text || "").replace(/["']/g, "");
};

export const enhancePrompt = async (prompt: string, model: ReasoningModelKey = 'gemini-3-flash-preview'): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model,
        contents: `Enhance the following text-to-image prompt to make it more vivid, detailed, and imaginative. Original: "${prompt}"`,
    });
    return (response.text || "").replace(/["']/g, "");
};

export const generateConcept = async (story: string, model: ReasoningModelKey = 'gemini-3-flash-preview'): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model,
        contents: `Convert this story into a concise text-to-image prompt: "${story}"`,
    });
    return response.text || "";
};

export const expandImage = (imageSrc: string, targetAspectRatio: AspectRatio): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
            const originalWidth = img.width;
            const originalHeight = img.height;
            const originalRatio = originalWidth / originalHeight;
            const [targetW, targetH] = targetAspectRatio.split(':').map(Number);
            const targetRatio = targetW / targetH;
            const canvas = document.createElement('canvas');
            let xOffset = 0;
            let yOffset = 0;
            if (targetRatio > originalRatio) {
                canvas.height = originalHeight;
                canvas.width = Math.round(originalHeight * targetRatio);
                xOffset = (canvas.width - originalWidth) / 2;
                yOffset = 0;
            } else {
                canvas.width = originalWidth;
                canvas.height = Math.round(originalWidth / targetRatio);
                xOffset = 0;
                yOffset = (canvas.height - originalHeight) / 2;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            ctx.drawImage(img, xOffset, yOffset, originalWidth, originalHeight);
            const compositeImageBase64 = canvas.toDataURL('image/png');
            const { mimeType, data } = parseDataUrl(compositeImageBase64);
            const prompt = `Expand the scene seamlessly to ${targetAspectRatio}. Match original style.`;
            try {
                const ai = getAi();
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ inlineData: { mimeType, data } }, { text: prompt }] },
                });
                const images: string[] = [];
                for (const part of response.candidates?.[0]?.content?.parts ?? []) {
                    if (part.inlineData) {
                        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
                if (images.length > 0) resolve(images);
                else reject(new Error("Expansion failed."));
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = imageSrc;
    });
};

export const generateNextSentence = async (
    story: string,
    language: StoryLanguageKey,
    style: StoryStyleKey,
    model: ReasoningModelKey
): Promise<string> => {
    const ai = getAi();
    const langMap: Record<StoryLanguageKey, string> = {
        thai: 'Thai',
        english: 'English',
        contextual: 'contextual',
    };
    const prompt = `Continue this story with ONE sentence. Lang: ${langMap[language]}. Style: ${style}.\nStory: ${story}`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return (response.text || "").trim();
};

export const generateStoryCaption = async (story: string, model: ReasoningModelKey, language: 'English' | 'Thai' = 'English'): Promise<string> => {
    const ai = getAi();
    const lang = language === 'Thai' ? 'Thai' : 'English';
    const prompt = `Summarize this story in ONE short sentence in ${lang}. Max 60 chars.\nStory: ${story}`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return (response.text || "").trim();
};

export const polishStory = async (story: string, model: ReasoningModelKey): Promise<string> => {
    const ai = getAi();
    const prompt = `Rewrite this story elegantly. Do not change plot.\nStory: ${story}`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return (response.text || "").trim();
};

export const translateStory = async (story: string, targetLanguage: 'Thai' | 'English', model: ReasoningModelKey): Promise<string> => {
    const ai = getAi();
    const prompt = `Translate this into ${targetLanguage}:\n${story}`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return (response.text || "").trim();
};

export const generateDesignFromStory = async (story: string, styleName: string, model: ReasoningModelKey): Promise<string> => {
    const ai = getAi();
    const prompt = `Create an image prompt based on this story in ${styleName} style.\nStory: ${story}`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return (response.text || "").trim();
};
