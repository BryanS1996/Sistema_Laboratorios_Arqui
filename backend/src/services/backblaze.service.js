const B2 = require('backblaze-b2');
const b2Config = require('../config/backblaze.config');
const { v4: uuidv4 } = require('uuid');

class BackblazeService {
    constructor() {
        if (!b2Config.applicationKeyId || !b2Config.applicationKey) {
            console.warn('⚠️ Backblaze B2 credentials not found. File uploads will fail.');
            return;
        }

        this.b2 = new B2({
            applicationKeyId: b2Config.applicationKeyId,
            applicationKey: b2Config.applicationKey
        });

        this.authorized = false;
    }

    async authorize() {
        try {
            if (!this.authorized) {
                await this.b2.authorize();
                this.authorized = true;
            }
        } catch (error) {
            console.error('B2 Authorization failed:', error);
            throw new Error('Failed to authorize with storage service');
        }
    }

    /**
     * Upload file to B2
     * @param {Buffer} fileBuffer 
     * @param {string} fileName 
     * @param {string} mimeType 
     */
    async uploadFile(fileBuffer, fileName, mimeType) {
        await this.authorize();

        try {
            // Get upload URL
            const response = await this.b2.getUploadUrl({
                bucketId: b2Config.bucketId
            });

            const { uploadUrl, authorizationToken } = response.data;

            // Generate unique filename
            const uniqueFileName = `reports/${uuidv4()}-${fileName}`;

            // Upload
            const uploadResponse = await this.b2.uploadFile({
                uploadUrl,
                uploadAuthToken: authorizationToken,
                fileName: uniqueFileName,
                data: fileBuffer,
                mime: mimeType
            });

            // Construct public URL (assuming public bucket)
            // Format: https://f000.backblazeb2.com/file/<BucketName>/<FileName>
            // Note: You need to replace 'f000' with your specific friendly URL from B2 console
            // or use the downloadUrl returned by authorize()

            // For simplicity/robustness, we'll return the fileId and name
            return {
                fileId: uploadResponse.data.fileId,
                fileName: uniqueFileName,
                url: `${this.b2.downloadUrl}/file/${b2Config.bucketName}/${uniqueFileName}`
            };

        } catch (error) {
            console.error('B2 Upload failed:', error);
            throw new Error('Failed to upload file');
        }
    }

    /**
     * Delete file from B2
     */
    async deleteFile(fileId, fileName) {
        await this.authorize();
        try {
            await this.b2.deleteFileVersion({
                fileId,
                fileName
            });
        } catch (error) {
            console.error('B2 Delete failed:', error);
            // Don't throw, just log
        }
    }
}

module.exports = new BackblazeService();
