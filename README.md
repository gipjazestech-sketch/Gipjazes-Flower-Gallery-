# gipjazes flower

Simple image gallery where you (the uploader) can add flower images and visitors can download them.

Setup (Windows PowerShell):

1. Open PowerShell and change to the project folder:

```powershell
cd C:\Users\user\flower-gallery
```

2. Install dependencies:

```powershell
npm install
```

3. (Optional) Set an upload password (recommended). If `UPLOAD_PASSWORD` is not set, the upload form will accept any non-empty password.

```powershell
$env:UPLOAD_PASSWORD = "your-secret-password"
```

4. Start the server:

```powershell
npm start
```

5. Open the gallery in a browser: `http://localhost:3000` and upload at `http://localhost:3000/upload.html`.

Notes:
- Uploaded files are stored in the `uploads/` folder.
- For production deployment, run behind a proper web server and secure uploads.
