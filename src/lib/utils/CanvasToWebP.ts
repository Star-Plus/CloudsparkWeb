export default class CanvasToWebP {
    public static convert(dataUrl: string, quality: number = 0.8): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                resolve(reader.result as string);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        } else {
                            reject(new Error("Canvas toBlob returned null"));
                        }
                    }, 'image/webp', quality);
                } else {
                    reject(new Error("Failed to get canvas 2D context"));
                }
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }
}