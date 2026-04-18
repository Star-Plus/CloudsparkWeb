export default class SizeFormatter {

    public static formatBytes(bytes: number): string {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + " KB";
        } else if (bytes < 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        } else if (bytes < 1024 * 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        } else {
            return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
        }
    }

    public static parseSizeToColor(sizeInBytes: number): string {
        const s = sizeInBytes / (1024 * 1024);

        let g, b, r: number;

        const maxSaturation = 200;
        
        if (s <= 500) {
            r = 0;

            const n = s / 500 * maxSaturation;
            g = maxSaturation - n;
            b = n;
        }
        else if (s > 500 && s <= 1000) {
            const n = (s - 500) / 500 * maxSaturation;
            r = n;
            g = 0;
            b = maxSaturation - n;
        }
        else {
            g = 0;
            b = 0;
            r = maxSaturation;
        }

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

    }
}