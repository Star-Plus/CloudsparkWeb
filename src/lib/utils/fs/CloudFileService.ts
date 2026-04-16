import { create, open } from "@tauri-apps/plugin-fs";
import { fetch } from "@tauri-apps/plugin-http";

type ProgressCallback = (params: ProgressParams) => void;

type ProgressParams = {
    loaded: number;
    total: number;
};

export default class CloudFileService {

    static async uploadFile(
        uploadUrl: string,
        filePath: string,
        networkProgressCallback?: ProgressCallback
    ): Promise<void> {

        const file = await open(filePath);
        const fileInfo = await file.stat();
        const totalSize = fileInfo.size;
        let uploaded = 0;

        const stream = new ReadableStream({
            async pull(controller) {
                const chunkSize = 256 * 1024;
                const buffer = new Uint8Array(chunkSize);

                try {
                    const bytesRead = await file.read(buffer);
                    if (bytesRead === 0 || bytesRead === null) {
                        controller.close();
                        await file.close();
                        return;
                    }

                    const chunk = buffer.subarray(0, bytesRead);
                    controller.enqueue(chunk);
                    uploaded += bytesRead;

                    networkProgressCallback?.({loaded: uploaded, total: totalSize});
                }
                catch (error) {
                    controller.error(error);
                    await file.close();
                }
            }
        })

        const response = await fetch(uploadUrl, {
            method: "PUT",
            body: stream,
            headers: {
                "Content-Length": totalSize.toString(),
                "Content-Type": "application/octet-stream"
            },
            duplex: "half"
        } as RequestInit & { duplex: string });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }

    }

    static async downloadFile(
        downloadUrl: string,
        savePath: string,
        networkProgressCallback?: ProgressCallback,
        diskProgressCallback?: ProgressCallback
    ): Promise<void> {

        const response = await fetch(downloadUrl, {method: "GET"});

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const total = parseInt(response.headers.get("Content-Length") || "0");
        let downloaded = 0;
        let written = 0;

        const file = await create(savePath);
        const reader = response.body?.getReader();

        if (!reader) {
            throw new Error("Failed to read response body");
        }

        const WRITE_THRESHOLD = 3 * 1024 * 1024;
        const MAX_RAM_BUFFER = 100 * 1024 * 1024;

        const chunkQueue: Uint8Array[] = [];
        let queuedBytes = 0;

        let networkDone = false;
        let isWriting = false;
        let writeError: Error | null = null;

        const processQueue = async () => {
            if (isWriting) return;
            isWriting = true;

            try {
                while (queuedBytes > 0 || !networkDone) {
                    if (queuedBytes >= WRITE_THRESHOLD || (networkDone && queuedBytes > 0)) {

                        const bytesToExtract = Math.min(queuedBytes, WRITE_THRESHOLD);
                        const writeBuffer = new Uint8Array(bytesToExtract);
                        let offset = 0;

                        while (offset < bytesToExtract && chunkQueue.length > 0) {
                            const chunk = chunkQueue[0];
                            const remainingSpace = bytesToExtract - offset;

                            if (chunk.length <= remainingSpace) {
                                writeBuffer.set(chunk, offset);
                                offset += chunk.length;
                                queuedBytes -= chunk.length;
                                chunkQueue.shift();
                            } else {
                                writeBuffer.set(chunk.subarray(0, remainingSpace), offset);
                                chunkQueue[0] = chunk.subarray(remainingSpace);
                                queuedBytes -= remainingSpace;
                                offset += remainingSpace;
                            }
                        }

                        // Force the OS to write every single byte of buffer
                        let unwrittenData = writeBuffer;
                        while (unwrittenData.length > 0) {
                            const writtenThisTime = await file.write(unwrittenData);

                            if (writtenThisTime === 0) {
                                throw new Error("Disk write failed: 0 bytes written (Storage full or access denied)");
                            }

                            unwrittenData = unwrittenData.subarray(writtenThisTime);
                        }

                        written += bytesToExtract;
                        diskProgressCallback?.({loaded: bytesToExtract, total});

                    } else {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                }
            } catch (error) {
                writeError = error as Error;
                console.error("Disk Write Crash:", error);
            } finally {
                isWriting = false;
            }
        };

        try {
            processQueue();

            while (true) {
                if (writeError) throw writeError;

                const { done, value } = await reader.read();

                if (value) {
                    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);

                    if (chunk.length > 0) {
                        downloaded += chunk.length;
                        networkProgressCallback?.({loaded: chunk.length, total});

                        chunkQueue.push(chunk);
                        queuedBytes += chunk.length;
                    }
                }

                if (done) {
                    networkDone = true;
                    break;
                }

                while (queuedBytes > MAX_RAM_BUFFER) {
                    if (writeError) throw writeError;
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
            }

            while (isWriting || queuedBytes > 0) {
                if (writeError) throw writeError;
                await new Promise(resolve => setTimeout(resolve, 20));
            }

            if (total > 0 && written !== total) {
                throw new Error(`Download interrupted! Stream closed early. Wrote ${written} bytes, but expected ${total} bytes. Server timeouts.`);
            }

        } finally {
            await file.close();
        }
    }
}
