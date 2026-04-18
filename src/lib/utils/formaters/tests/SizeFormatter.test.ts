import SizeFormatter from "../SizeFormatter";

describe("SizeFormatter", () => {

    test("formatBytes should format bytes correctly", () => {
        expect(SizeFormatter.formatBytes(500)).toBe("500 B");
        expect(SizeFormatter.formatBytes(2048)).toBe("2.00 KB");
        expect(SizeFormatter.formatBytes(5 * 1024 * 1024)).toBe("5.00 MB");
        expect(SizeFormatter.formatBytes(3 * 1024 * 1024 * 1024)).toBe("3.00 GB");
        expect(SizeFormatter.formatBytes(7 * 1024 * 1024 * 1024 * 1024)).toBe("7.00 TB");
    });

    test("parseSizeToColor should return correct RGB color", () => {
        expect(SizeFormatter.parseSizeToColor(0)).toBe("rgb(0, 200, 0)");
        expect(SizeFormatter.parseSizeToColor(250 * 1024 * 1024)).toBe("rgb(0, 100, 100)");
        expect(SizeFormatter.parseSizeToColor(750 * 1024 * 1024)).toBe("rgb(100, 0, 100)");
        expect(SizeFormatter.parseSizeToColor(1500 * 1024 * 1024)).toBe("rgb(200, 0, 0)");
    });

});