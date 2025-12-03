const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'flower-gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Enable JSON body parsing for password check if needed

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get images from Cloudinary
app.get('/api/images', async (req, res) => {
  try {
    // Fetch resources from Cloudinary
    const result = await cloudinary.search
      .expression('folder:flower-gallery')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const images = result.resources.map(file => ({
      filename: file.filename,
      url: file.secure_url
    }));

    res.json(images);
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Note: Password check logic is simplified here. 
  // Ideally, check password BEFORE upload to save bandwidth/storage, 
  // but Multer middleware runs first. 
  // For better security, use a separate auth middleware or check before multer (requires different handling).

  const provided = (req.body && req.body.password) ? String(req.body.password) : '';
  const expected = process.env.UPLOAD_PASSWORD || '';
  const ok = expected ? (provided === expected) : true; // Allow if no password set

  if (!ok && expected) {
    // If password failed, we should delete the uploaded file from Cloudinary
    cloudinary.uploader.destroy(req.file.filename);
    return res.status(401).json({ error: 'Invalid upload password' });
  }

  res.json({
    success: true,
    filename: req.file.filename,
    url: req.file.path
  });
});

app.listen(PORT, () => {
  console.log(`Gipjazes Flower running on http://localhost:${PORT}`);
});
