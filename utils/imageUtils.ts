export const blobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const getResizedImageBlob = (
    base64Image: string,
    scale: number,
    type: 'image/png' = 'image/png'
): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const newWidth = Math.round(img.width * scale);
            const newHeight = Math.round(img.height * scale);
            
            canvas.width = newWidth > 0 ? newWidth : 1;
            canvas.height = newHeight > 0 ? newHeight : 1;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob returned null.'));
                    }
                }, type);
            } else {
                reject(new Error('Could not get 2D context from canvas.'));
            }
        };
        img.onerror = (error) => {
            console.error("Error loading image for resizing:", error);
            reject(new Error('Failed to load image for resizing.'));
        };
        img.src = base64Image;
    });
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const downloadResizedImage = async (base64Image: string, fileName: string, scale: number) => {
    try {
        const blob = await getResizedImageBlob(base64Image, scale, 'image/png');
        if (blob) {
            downloadBlob(blob, fileName);
        } else {
            console.error("Failed to create blob for download.");
        }
    } catch (error) {
        console.error("Error during image download:", error);
    }
};

export const downloadImage = (base64Image: string, fileName: string) => {
    downloadResizedImage(base64Image, fileName, 1.0);
};
