const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

const imagesDir = path.join(__dirname, 'images');

/* ===========================
   HOME → RANDOM IMAGE
=========================== */
app.get('/', async (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Happy Scan</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #020617;
    }

    img {
      max-width: 92%;
      max-height: 92%;
      border-radius: 18px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
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

/* ===========================
   RANDOM IMAGE API
=========================== */
app.get('/image', async (req, res) => {
  try {
    let images = await fs.promises.readdir(imagesDir);
    images = images.filter(file =>
      /\.(png|jpg|jpeg|gif)$/i.test(file)
    );

    if (!images.length) {
      return res.status(500).send('No images found');
    }

    const randomImage =
      images[Math.floor(Math.random() * images.length)];

    res.sendFile(path.join(imagesDir, randomImage));
  } catch (err) {
    res.status(500).send('Error loading images');
  }
});

/* ===========================
   QR PAGE
=========================== */
app.get('/qr', async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/`;

  const qr = await QRCode.toDataURL(url, {
    width: 260,
    margin: 2,
    color: {
      dark: '#020617',
      light: '#ffffff'
    }
  });

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Happy Scan</title>
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

      background:
        radial-gradient(circle at 15% 20%, rgba(99,102,241,0.35), transparent 45%),
        radial-gradient(circle at 85% 25%, rgba(56,189,248,0.30), transparent 45%),
        radial-gradient(circle at 50% 85%, rgba(168,85,247,0.25), transparent 50%),
        linear-gradient(180deg, #020617, #020617);

      background-size: 200% 200%;
      animation: bgMove 20s ease infinite;
      position: relative;
    }

    @keyframes bgMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* ===== TITLE ===== */
    .title {
      position: absolute;
      top: 42px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 34px;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: #eef2ff;

      text-shadow:
        0 0 10px rgba(99,102,241,0.8),
        0 0 24px rgba(168,85,247,0.6);

      animation: float 4s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes float {
      0% { transform: translate(-50%, 0); }
      50% { transform: translate(-50%, -6px); }
      100% { transform: translate(-50%, 0); }
    }

    /* ===== CARD ===== */
    .card {
      width: 320px;
      padding: 26px 22px;
      margin-top: 40px;

      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.14),
        rgba(255,255,255,0.06)
      );

      backdrop-filter: blur(18px);
      border-radius: 24px;

      box-shadow:
        0 40px 90px rgba(0,0,0,0.55),
        inset 0 1px 0 rgba(255,255,255,0.18);

      text-align: center;
    }

    .qr-box {
      background: #ffffff;
      padding: 16px;
      border-radius: 20px;
      display: inline-block;

      box-shadow:
        0 0 0 6px rgba(99,102,241,0.15),
        0 18px 40px rgba(0,0,0,0.35);
    }

    .qr-box img {
      width: 220px;
      height: 220px;
      display: block;
    }

    .desc {
      margin-top: 18px;
      font-size: 13px;
      color: #c7d2fe;
    }

    .sub {
      margin-top: 6px;
      font-size: 11px;
      color: #a5b4fc;
    }
  </style>
</head>

<body>
  <div class="title">Happy Scan</div>

  <div class="card">
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

/* ===========================
   START SERVER
=========================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
