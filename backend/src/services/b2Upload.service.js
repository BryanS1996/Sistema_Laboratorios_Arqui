const { getB2Client, getBucketName, isB2Available } = require('../config/b2S3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * File Upload Service for Backblaze B2
 * 
 * Handles uploading files to B2 storage with automatic naming and metadata
 */

class B2UploadService {
    /**
     * Upload a file to B2
     * 
     * @param {Buffer} fileBuffer - File content as buffer
     * @param {string} originalName - Original filename
     * @param {string} mimeType - MIME type
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Upload result with URL
     */
    async uploadFile(fileBuffer, originalName, mimeType, metadata = {}) {
        if (!isB2Available()) {
            throw new Error('Backblaze B2 is not configured. Cannot upload files.');
        }

        const b2Client = getB2Client();
        const bucket = getBucketName();

        // Generate unique filename
        const ext = path.extname(originalName);
        const uniqueName = `${uuidv4()}${ext}`;
        const key = `uploads/${new Date().getFullYear()}/${uniqueName}`;

        const params = {
            Bucket: bucket,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            Metadata: {
                originalname: originalName,
                uploaddate: new Date().toISOString(),
                ...metadata
            }
        };

        try {
            const result = await b2Client.upload(params).promise();

            return {
                success: true,
                key: key,
                uniqueName: uniqueName,
                originalName: originalName,
                url: result.Location,
                etag: result.ETag,
                bucket: bucket
            };
        } catch (error) {
            console.error('❌ B2 upload error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Delete a file from B2
     * 
     * @param {string} key - File key in B2
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(key) {
        if (!isB2Available()) {
            console.warn('⚠️  B2 not configured, skipping delete');
            return false;
        }

        const b2Client = getB2Client();
        const bucket = getBucketName();

        try {
            await b2Client.deleteObject({
                Bucket: bucket,
                Key: key
            }).promise();

            console.log(`✅ Deleted file: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete file ${key}:`, error);
            return false;
        }
    }

    /**
     * Get a pre-signed URL for temporary file access
     * 
     * @param {string} key - File key in B2
     * @param {number} expiresIn - Expiration in seconds (default: 1 hour)
     * @returns {Promise<string>} Pre-signed URL
     */
    async getPresignedUrl(key, expiresIn = 3600) {
        if (!isB2Available()) {
            throw new Error('B2 not configured');
        }

        const b2Client = getB2Client();
        const bucket = getBucketName();

        const url = b2Client.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: key,
            Expires: expiresIn
        });

        return url;
    }

    /**
     * Check if B2 is available
     */
    isAvailable() {
        return isB2Available();
    }
}

module.exports = new B2UploadService();
