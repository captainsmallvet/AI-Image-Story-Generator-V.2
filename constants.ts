export const ASPECT_RATIOS = ["16:9", "1:1", "3:4", "4:3", "9:16"] as const;

export type AspectRatio = typeof ASPECT_RATIOS[number];

export const IMAGE_STYLES = [
    { key: 'photorealistic', name: 'Photorealistic' },
    { key: 'chalermchai_kositpipat', name: 'Chalermchai Kositpipat' },
    { key: 'modern_thai_murals', name: 'Modern Thai Murals' },
    { key: 'lai_thai', name: 'Lai Thai' },
    { key: 'cinematic', name: 'Cinematic' },
    { key: 'anime', name: 'Anime' },
    { key: 'disney_cartoon', name: 'Disney Cartoon' },
    { key: 'cartoon_3d', name: '3D Cartoon' },
    { key: 'fantasy', name: 'Fantasy Art' },
    { key: 'cyberpunk', name: 'Cyberpunk' },
    { key: 'pixel_art', name: 'Pixel Art' },
    { key: 'watercolor', name: 'Watercolor' },
    { key: 'line_art', name: 'Line Art' },
    { key: 'bw_laser_printer', name: 'Black & White Laser Printer' }
] as const;

export type ImageStyleKey = typeof IMAGE_STYLES[number]['key'];

export const STYLE_PROMPT_PREFIXES: Record<ImageStyleKey, string> = {
    photorealistic: 'A hyper-realistic, high-detail, professional photograph of',
    chalermchai_kositpipat: 'painting in the style of Chalermchai Kositpipat, Thai contemporary traditional spiritual art, highly detailed and refined, inspired by Buddhist and mythological themes, intricate Thai traditional patterns (Lai Thai), luminous glowing colors of gold, blue, violet, and white, sacred and ethereal atmosphere, elegant flowing lines and fine brush details, golden ornaments, divine beings, celestial architecture, radiant aura, painted in the style of modern Thai temple murals, ultra-detailed, vibrant, luminous, visionary masterpiece, of',
    modern_thai_murals: 'painting in the style of Modern Thai Murals, Thai contemporary traditional spiritual art, highly detailed and refined, inspired by mythological themes, intricate Thai traditional patterns (Lai Thai), luminous glowing colors of gold, blue, violet, and white, sacred and ethereal atmosphere, elegant flowing lines and fine brush details, golden ornaments, celestial architecture, radiant aura, painted in the style of modern Thai murals, ultra-detailed, vibrant, luminous, visionary masterpiece, of',
    lai_thai: 'painting in the style of Modern Thai Art, Thai contemporary traditional art, highly detailed and refined, inspired by intricate Thai traditional patterns (Lai Thai), luminous glowing colors of gold, blue, violet, and white, elegant flowing lines and fine brush details, radiant aura, ultra-detailed, vibrant, luminous, visionary masterpiece, of',
    cinematic: 'Cinematic film still, dramatic lighting, high detail, of',
    anime: 'Vibrant anime style, detailed illustration of',
    disney_cartoon: 'Classic Disney animation style, vibrant colors, expressive characters, of',
    cartoon_3d: 'Modern 3D cartoon style, like Pixar animation, detailed textures, cinematic lighting, of',
    fantasy: 'Epic fantasy digital painting, mythical, high detail, concept art of',
    cyberpunk: 'Cyberpunk style, neon lights, futuristic city, detailed illustration of',
    pixel_art: 'Pixel art, 16-bit retro gaming aesthetic, of',
    watercolor: 'Beautiful watercolor painting, soft colors, artistic, of',
    line_art: 'Clean black and white line art, minimalist, of',
    bw_laser_printer: 'Black and white illustration optimized for laser printing, high contrast, sharp clean lines, pure black ink on white paper style, stippling or hatching for shading instead of gray gradients, vector graphic style, detailed and clear, of',
};

export const IMAGE_MODELS = [
    { key: 'imagen-4.0-generate-001', name: 'Imagen 4.0 (Highest Quality)' },
    { key: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image (Best Text/Thai)' },
    { key: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image (Faster/Backup)' },
] as const;

export type ImageModelKey = typeof IMAGE_MODELS[number]['key'];

export const STORY_LANGUAGES = [
    { key: 'thai', name: 'ภาษาไทย' },
    { key: 'english', name: 'ภาษาอังกฤษ' },
    { key: 'contextual', name: 'ตามสถานการณ์' },
] as const;

export type StoryLanguageKey = typeof STORY_LANGUAGES[number]['key'];

export const STORY_STYLES = [
    { key: 'unspecified', name: 'ไม่ระบุ' },
    { key: 'twist', name: 'หักมุม' },
    { key: 'example', name: 'ยกตัวอย่าง' },
    { key: 'mystery', name: 'ลึกลับซ่อนเงื่อน' },
    { key: 'motto', name: 'คำขวัญเตือนใจ' },
    { key: 'kids_tale', name: 'นิทานสำหรับเด็ก' },
    { key: 'academic_dharma', name: 'วิชาการธรรมะ' },
    { key: 'dharma_novel', name: 'นิยายธรรมะ' },
    { key: 'casual_dharma', name: 'คุยธรรมะแบบเป็นกันเอง' },
    { key: 'academic', name: 'นักวิชาการ' },
    { key: 'english_teacher', name: 'ครูสอนภาษาอังกฤษ' },
    { key: 'comforting', name: 'ปลอบใจ ให้กำลังใจ' },
    { key: 'thai_poem', name: 'แต่งกลอน' },
    { key: 'romance_novel', name: 'นิยายรักโรแมนติก' },
    { key: 'sci_fi_novel', name: 'นิยายวิทยาศาสตร์' },
    { key: 'horror_novel', name: 'แนวผีหลอกวิญญาณหลอน' },
    { key: 'lighthearted_comedy', name: 'เรื่องตลก เบาสมอง' },
    { key: 'inspiration', name: 'สร้างแรงบันดาลใจ' },
    { key: 'analysis', name: 'พูดเชิงวิเคราะห์' },
    { key: 'adventure', name: 'ผจญภัย บู้ ตื่นเต้น' },
    { key: 'tear_jerker', name: 'เรื่องเศร้าเคล้าน้ำตา' },
    { key: 'beyond_imagination', name: 'เรื่องเหนือจินตนาการ' },
] as const;

export type StoryStyleKey = typeof STORY_STYLES[number]['key'];