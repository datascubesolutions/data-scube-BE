# Image Upload API - Cloudinary Integration

## Overview

Complete image upload API using Cloudinary for storing and managing images.

## Configuration

```env
CLOUDINARY_CLOUD_NAME=nikul
CLOUDINARY_API_KEY=729245361862254
CLOUDINARY_API_SECRET=QLi3G-Du8HvHKvhxWPeYHdwCXMM
```

## API Endpoints

### 1. Upload Single Image

```http
POST /api/upload/image
Content-Type: multipart/form-data
```

**Form Data:**

- `image` (required) - Image file (jpeg, jpg, png, gif, webp)
- `folder` (optional) - Cloudinary folder name (default: "datascube")
- `tags` (optional) - Comma-separated tags (e.g., "profile,avatar")

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/nikul/image/upload/v1234567890/datascube/abc123.jpg",
    "publicId": "datascube/abc123",
    "format": "jpg",
    "width": 1000,
    "height": 800,
    "size": 245678
  }
}
```

### 2. Upload Multiple Images

```http
POST /api/upload/images
Content-Type: multipart/form-data
```

**Form Data:**

- `images` (required) - Multiple image files (max 10)
- `folder` (optional) - Cloudinary folder name
- `tags` (optional) - Comma-separated tags

**Response:**

```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully",
  "data": {
    "images": [
      {
        "url": "https://res.cloudinary.com/nikul/image/upload/v1234567890/datascube/img1.jpg",
        "publicId": "datascube/img1",
        "format": "jpg",
        "width": 1000,
        "height": 800,
        "size": 245678
      },
      {
        "url": "https://res.cloudinary.com/nikul/image/upload/v1234567890/datascube/img2.jpg",
        "publicId": "datascube/img2",
        "format": "jpg",
        "width": 1200,
        "height": 900,
        "size": 312456
      }
    ],
    "count": 2
  }
}
```

### 3. Delete Image

```http
DELETE /api/upload/image/:publicId
```

**Example:**

```http
DELETE /api/upload/image/datascube/abc123
```

**Response:**

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "result": "ok"
  }
}
```

### 4. Get Image Details

```http
GET /api/upload/image/:publicId
```

**Response:**

```json
{
  "success": true,
  "message": "Image details retrieved successfully",
  "data": {
    "url": "https://res.cloudinary.com/nikul/image/upload/v1234567890/datascube/abc123.jpg",
    "publicId": "datascube/abc123",
    "format": "jpg",
    "width": 1000,
    "height": 800,
    "size": 245678,
    "createdAt": "2024-11-06T10:30:00Z"
  }
}
```

## Features

### Image Optimization

- ✅ Automatic format conversion (WebP for modern browsers)
- ✅ Quality optimization
- ✅ Maximum dimensions: 1000x1000px
- ✅ Automatic compression

### File Validation

- ✅ Allowed formats: JPEG, JPG, PNG, GIF, WebP
- ✅ Maximum file size: 10MB
- ✅ File type validation
- ✅ Extension validation

### Cloudinary Features

- ✅ Secure HTTPS URLs
- ✅ CDN delivery
- ✅ Image transformations
- ✅ Folder organization
- ✅ Tag management

## Usage Examples

### cURL Examples

#### Upload Single Image

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/image.jpg" \
  -F "folder=products" \
  -F "tags=product,featured"
```

#### Upload Multiple Images

```bash
curl -X POST http://localhost:3000/api/upload/images \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "folder=gallery"
```

#### Delete Image

```bash
curl -X DELETE http://localhost:3000/api/upload/image/datascube/abc123
```

### JavaScript/Axios Examples

#### Upload Single Image

```javascript
const formData = new FormData();
formData.append("image", fileInput.files[0]);
formData.append("folder", "products");
formData.append("tags", "product,featured");

const response = await axios.post("/api/upload/image", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

console.log("Image URL:", response.data.data.url);
```

#### Upload Multiple Images

```javascript
const formData = new FormData();
for (let i = 0; i < files.length; i++) {
  formData.append("images", files[i]);
}
formData.append("folder", "gallery");

const response = await axios.post("/api/upload/images", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

console.log("Uploaded:", response.data.data.count, "images");
```

### React Example

```jsx
import React, { useState } from "react";
import axios from "axios";

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("folder", "user-uploads");

    try {
      const response = await axios.post("/api/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImageUrl(response.data.data.url);
      alert("Image uploaded successfully!");
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
```

## Error Handling

### Common Errors

**No file provided:**

```json
{
  "success": false,
  "message": "No image file provided"
}
```

**Invalid file type:**

```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

**File too large:**

```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB"
}
```

**Cloudinary error:**

```json
{
  "success": false,
  "message": "Upload failed",
  "error": "Cloudinary error details"
}
```

## Image Transformations

You can request transformed versions of uploaded images using Cloudinary's URL parameters:

### Resize

```
https://res.cloudinary.com/nikul/image/upload/w_300,h_300,c_fill/datascube/abc123.jpg
```

### Thumbnail

```
https://res.cloudinary.com/nikul/image/upload/w_150,h_150,c_thumb/datascube/abc123.jpg
```

### Quality

```
https://res.cloudinary.com/nikul/image/upload/q_auto:low/datascube/abc123.jpg
```

### Format

```
https://res.cloudinary.com/nikul/image/upload/f_webp/datascube/abc123.jpg
```

## Best Practices

1. **Always validate files on frontend** before uploading
2. **Show upload progress** for better UX
3. **Handle errors gracefully** with user-friendly messages
4. **Store URLs in database** for easy retrieval
5. **Use appropriate folders** for organization
6. **Add tags** for better searchability
7. **Delete unused images** to save storage
8. **Use transformations** for different sizes

## Security

- ✅ File type validation (server-side)
- ✅ File size limits (10MB)
- ✅ Secure HTTPS URLs
- ✅ Private API credentials
- ✅ Error logging
- ⏳ Add authentication middleware (recommended)
- ⏳ Add rate limiting (recommended)

## Testing

Test the upload API:

```bash
# Upload test image
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@test-image.jpg"
```

## Postman Collection

Import the upload endpoints into Postman:

1. Create new request
2. Set method to POST
3. URL: `{{baseUrl}}/api/upload/image`
4. Body → form-data
5. Add key "image" with type "File"
6. Select image file
7. Send request

## Production Deployment

Before deploying to production:

1. ✅ Set environment variables on server
2. ✅ Test upload functionality
3. ⏳ Add authentication middleware
4. ⏳ Set up rate limiting
5. ⏳ Configure CORS properly
6. ⏳ Monitor Cloudinary usage
7. ⏳ Set up backup strategy

## Cloudinary Dashboard

Access your Cloudinary dashboard:

- URL: https://cloudinary.com/console
- Cloud name: nikul
- View uploaded images, usage, and analytics

## Support

For issues:

- Check Cloudinary configuration in `.env`
- Verify API credentials
- Check file size and format
- Review server logs
- Test with curl first
