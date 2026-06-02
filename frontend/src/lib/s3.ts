import axios from 'axios';

// S3Service інкапсулює логіку прямого завантаження файлів у хмарне сховище.
// Використовується препідписаний URL (uploadUrl) для безпечного завантаження без 
// розголошення секретів S3 на клієнта. onProgress дозволяє відображати прогрес-бар.
export class S3Service {
    static async uploadFile(uploadUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
        try {
            await axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": file.type,
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });
        } catch (error) {
            console.error("upload file to s3:", error);
            throw new Error("Failed to upload file. Try again later!");
        }
    }
}
