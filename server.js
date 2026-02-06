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
    * {
      box-sizing: border-box;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      margin: 0;
      height: 100vh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #020617;
      position: relative;
    }

    /* ===== MOVING BACKGROUND ===== */
    body::before {
      content: "";
      position: absolute;
      inset: -40%;
      background:
        radial-gradient(circle at 20% 20%, rgba(99,102,241,0.35), transparent 40%),
        radial-gradient(circle at 80% 30%, rgba(56,189,248,0.30), transparent 45%),
        radial-gradient(circle at 50% 80%, rgba(168,85,247,0.28), transparent 50%);
      animation: drift 28s linear infinite;
      z-index: 0;
    }

    @keyframes drift {
      0%   { transform: translate(0, 0); }
      50%  { transform: translate(6%, -6%); }
      100% { transform: translate(0, 0); }
    }

    /* ===== TITLE ===== */
    .title {
      position: absolute;
      top: 28px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1.4px;
      color: #eef2ff;
      z-index: 2;

      text-shadow:
        0 0 10px rgba(99,102,241,0.8),
        0 0 22px rgba(168,85,247,0.6);

      animation: glow 3s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { opacity: 0.9; }
      50% { opacity: 1; }
    }

    /* ===== IMAGE ===== */
    img {
      max-width: 90%;
      max-height: 75%;
      border-radius: 18px;
      box-shadow: 0 30px 70px rgba(0,0,0,0.65);
      animation: fade 0.5s ease;
      z-index: 2;
    }

    @keyframes fade {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    /* ===== HINT ===== */
    .hint {
      position: fixed;
      bottom: 16px;
      font-size: 12px;
      color: #a5b4fc;
      z-index: 2;
    }
  </style>
</head>

<body>
  <div class="title">Happy Scan</div>

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
      /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
    );

    if (!images.length) {
      return res.status(500).send('No images found');
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];
    res.sendFile(path.join(imagesDir, randomImage));
  } catch {
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
    color: { dark: '#020617', light: '#ffffff' }
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
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #020617;
      position: relative;
    }

    /* ===== GRADIENT LAYERS ===== */
    body::before {
      content: "";
      position: absolute;
      inset: -40%;
      background:
        radial-gradient(circle at 20% 20%, rgba(99,102,241,0.35), transparent 40%),
        radial-gradient(circle at 80% 30%, rgba(56,189,248,0.30), transparent 45%),
        radial-gradient(circle at 50% 80%, rgba(168,85,247,0.28), transparent 50%);
      animation: drift 30s linear infinite;
      z-index: 0;
    }

    @keyframes drift {
      0% { transform: translate(0,0); }
      50% { transform: translate(6%,-6%); }
      100% { transform: translate(0,0); }
    }

    /* ===== GLOW ORBS ===== */
    .orb {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.35;
      animation: orbMove 28s ease-in-out infinite;
      z-index: 0;
    }

    .orb.blue {
      background: #3b82f6;
      top: 12%;
      left: 12%;
    }

    .orb.purple {
      background: #a855f7;
      bottom: 10%;
      right: 15%;
      animation-delay: -14s;
    }

    @keyframes orbMove {
      0% { transform: translate(0,0); }
      50% { transform: translate(90px,-70px); }
      100% { transform: translate(0,0); }
    }

    /* ===== PARTICLES ===== */
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255,255,255,0.6);
      border-radius: 50%;
      animation: float 14s linear infinite;
      z-index: 1;
    }

    @keyframes float {
      from { transform: translateY(110vh); opacity: 0; }
      10% { opacity: 0.8; }
      to { transform: translateY(-120vh); opacity: 0; }
    }

    /* ===== TITLE ===== */
    .title {
      position: absolute;
      top: 32px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 40px;
      font-weight: 900;
      letter-spacing: 2px;
      z-index: 2;
      background: linear-gradient(90deg, #818cf8, #38bdf8, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: glow 3s ease-in-out infinite;
    }

    @keyframes glow {
      0%,100% { filter: drop-shadow(0 0 10px rgba(99,102,241,.6)); }
      50% { filter: drop-shadow(0 0 24px rgba(168,85,247,1)); }
    }

    /* ===== CARD ===== */
    .card {
      width: 320px;
      padding: 26px 22px;
      margin-top: 70px;
      z-index: 2;
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
      animation: pop 0.8s ease;
    }

    @keyframes pop {
      from { transform: scale(0.92); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
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
    }

    .desc {
      margin-top: 18px;
      font-size: 13px;
      color: #c7d2fe;
    }
      .scan-text {
  margin-bottom: 14px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 3px;
  text-align: center;

  background: linear-gradient(
    90deg,
    #818cf8,
    #38bdf8,
    #a855f7
  );

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow:
    0 0 12px rgba(99,102,241,0.7),
    0 0 26px rgba(168,85,247,0.6);

  animation: scanGlow 2.5s ease-in-out infinite;
}

@keyframes scanGlow {
  0%, 100% {
    opacity: 0.85;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}


    .sub {
      margin-top: 6px;
      font-size: 11px;
      color: #a5b4fc;
    }
  </style>
</head>

<body>
  <div class="orb blue"></div>
  <div class="orb purple"></div>

  <div class="title">Happy Scan</div>

  <div class="card">
  <div class="scan-text">SCAN ME</div>
    <div class="qr-box">
      <img src="${qr}" alt="QR Code">
    </div>
    <div class="desc">Each scan displays a random image</div>
    <div class="sub">Rescan to view a different one</div>
  </div>
</body>

<script>
  for (let i = 0; i < 35; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 10 + Math.random() * 20 + "s";
    p.style.opacity = Math.random();
    p.style.transform = "scale(" + (Math.random() + 0.5) + ")";
    document.body.appendChild(p);
  }
</script>
</html>
  `);
});

/* ===========================
   START SERVER
=========================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
