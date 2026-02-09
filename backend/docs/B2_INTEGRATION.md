# Backblaze B2 Integration

## Configuration

The Backblaze B2 integration uses the S3-compatible API via `aws-sdk`.

### Environment Variables

Add to your `.env`:

```env
B2_KEY_ID=your_application_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_NAME=your-bucket-name
B2_REGION=us-west-004  # Optional, defaults to us-west-004
```

### Getting B2 Credentials

1. Go to [Backblaze B2](https://secure.backblaze.com/)
2. Navigate to **App Keys**
3. Create a new application key with:
   - Read and write permissions
   - Access to your bucket
4. Copy the **keyID** and **applicationKey**
5. Note your **bucketName**

## Usage

### Upload a File

```javascript
const b2UploadService = require('./services/b2Upload.service');
const multer = require('multer');

// Using with multer
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Check if B2 is available
    if (!b2UploadService.isAvailable()) {
      return res.status(503).json({ 
        error: 'File upload service is not configured' 
      });
    }

    const file = req.file;
    const result = await b2UploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      { uploadedBy: req.user.id }
    );

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: result.url,
        key: result.key,
        originalName: result.originalName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Delete a File

```javascript
await b2UploadService.deleteFile('uploads/2024/abc-123.pdf');
```

### Get Temporary URL

```javascript
// Get URL that expires in 1 hour (3600 seconds)
const url = await b2UploadService.getPresignedUrl(
  'uploads/2024/abc-123.pdf',
  3600
);
```

## File Organization

Files are automatically organized by year:
```
bucket/
  uploads/
    2024/
      uuid-filename.pdf
      uuid-filename.jpg
    2025/
      uuid-filename.pdf
```

## Error Handling

The service gracefully handles missing B2 configuration:

- If B2 credentials are not set, `isAvailable()` returns `false`
- Upload attempts without configuration throw descriptive errors
- The application can still run without B2 (useful for local development)

## Testing Locally

For local development without B2:

1. Don't set B2 credentials in `.env`
2. The service will log warnings but won't crash
3. Upload endpoints should check `isAvailable()` and return appropriate errors

## Security

- ✅ Credentials loaded from environment variables only
- ✅ Never expose raw credentials in logs
- ✅ Files get unique UUID-based names (prevents overwrites)
- ✅ Pre-signed URLs expire automatically
- ✅ Graceful degradation if not configured
