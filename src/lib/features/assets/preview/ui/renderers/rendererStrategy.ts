export type PreviewRenderer = "image" | "text" | "unsupported" | "loading" | "error";

export class RendererStrategy {
	private static readonly imageExtensions = [
		"webp",
		"png",
		"jpg",
		"jpeg",
		"gif",
		"bmp",
		"svg",
		"ico",
	];

	private static readonly textExtensions = [
		"txt",
		"json",
		"xml",
		"csv",
		"md",
		"html",
		"css",
		"js",
		"ts",
		"py",
		"java",
		"cpp",
		"c",
		"h",
		"hpp",
		"yaml",
		"yml",
		"toml",
		"ini",
		"log",
	];

	static getRenderer(fileExtension: string): PreviewRenderer {
		const ext = fileExtension.toLowerCase();

		if (this.imageExtensions.includes(ext)) {
			return "image";
		}

		if (this.textExtensions.includes(ext)) {
			return "text";
		}

		return "text";
	}

	static isImageType(fileExtension: string): boolean {
		return this.getRenderer(fileExtension) === "image";
	}

	static isTextType(fileExtension: string): boolean {
		return this.getRenderer(fileExtension) === "text";
	}
}
