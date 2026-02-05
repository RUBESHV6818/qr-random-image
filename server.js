const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

const imagesDir = path.join(__dirname, 'images');

// Home → shows random image
app.get('/', async (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Random Image</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0f172a;
    }
    img {
      max-width: 92%;
      max-height: 92%;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,.6);
      animation: fade 0.5s ease;
    }
    @keyframes fade {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .hint {
      position: fixed;
      bottom: 16px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <img src="/image?nocache=${Date.now()}">
  <div class="hint">Scan again or refresh for another image</div>
</body>
</html>
  `);
});

// Serves random image
app.get('/image', async (req, res) => {
  try {
    let images = await fs.promises.readdir(imagesDir);
    images = images.filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));

    if (!images.length) {
      return res.status(500).send('No images found');
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];
    res.sendFile(path.join(imagesDir, randomImage));
  } catch {
    res.status(500).send('Error loading images');
  }
});

// QR page
app.get('/qr', async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/`;

  const qr = await QRCode.toDataURL(url, {
    width: 260,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>QR Experience</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      margin: 0;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #6b6ef9, #0f1438 70%);
    }

    .card {
      width: 320px;
      padding: 26px 22px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      border-radius: 22px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
      text-align: center;
    }

    h1 {
      margin: 0 0 18px;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      letter-spacing: 0.3px;
    }

    .qr-box {
      background: #ffffff;
      padding: 14px;
      border-radius: 16px;
      display: inline-block;
    }

    .qr-box img {
      width: 220px;
      height: 220px;
      display: block;
    }

    .desc {
      margin-top: 18px;
      font-size: 13px;
      color: #d0d4ff;
    }

    .sub {
      margin-top: 6px;
      font-size: 11px;
      color: #9aa0ff;
    }
  </style>
</head>

<body>
  <div class="card">
    <h1>QR Experience</h1>

    <div class="qr-box">
      <img src="${qr}" alt="QR Code">
    </div>

    <div class="desc">Each scan displays a random image</div>
    <div class="sub">Rescan to view a different one</div>
  </div>
</body>
</html>
  `);
});


app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
