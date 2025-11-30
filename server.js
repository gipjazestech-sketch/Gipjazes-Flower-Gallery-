const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safe);
  }
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) || allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/images', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read uploads' });
    const images = files.filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f))
      .map(f => ({ filename: f, url: `/uploads/${encodeURIComponent(f)}` }));
    res.json(images);
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const provided = (req.body && req.body.password) ? String(req.body.password) : '';
  const expected = process.env.UPLOAD_PASSWORD || '';

  // If UPLOAD_PASSWORD env var is set, require it. If not set, allow any non-empty password from form.
  const ok = expected ? (provided === expected) : Boolean(provided);

  if (!ok) {
    // delete file
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(401).json({ error: 'Invalid upload password' });
  }

  res.json({ success: true, filename: req.file.filename, url: `/uploads/${encodeURIComponent(req.file.filename)}` });
});

app.listen(PORT, () => {
  console.log(`Gipjazes Flower running on http://localhost:${PORT}`);
});
