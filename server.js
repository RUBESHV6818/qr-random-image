const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

const imagesDir = path.join(__dirname, 'images');

// Home page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Random Image Viewer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #111;
        }
        img {
            max-width: 95%;
            max-height: 95%;
            border-radius: 12px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
        }
        .hint {
            position: fixed;
            bottom: 15px;
            color: #aaa;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <img src="/image?rand=${Date.now()}" />
    <div class="hint">Refresh or scan again for another image</div>
</body>
</html>
    `);
});

// Random image endpoint
app.get('/image', async (req, res) => {
    try {
        let images = await fs.promises.readdir(imagesDir);

        images = images.filter(file =>
            /\.(jpg|jpeg|png|gif)$/i.test(file)
        );

        if (images.length === 0) {
            return res.status(500).send('No images found');
        }

        const randomImage =
            images[Math.floor(Math.random() * images.length)];

        res.sendFile(path.join(imagesDir, randomImage));
    } catch (err) {
        res.status(500).send('Error reading images folder');
    }
});

// QR page
app.get('/qr', async (req, res) => {
    try {
        const url = `${req.protocol}://${req.get('host')}/`;
        const qr = await QRCode.toDataURL(url);

        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>QR Image Viewer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea, #764ba2);
            font-family: Arial, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            width: 90%;
            max-width: 350px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        img {
            width: 220px;
            height: 220px;
        }
        p {
            color: #555;
            margin-top: 15px;
            font-size: 14px;
        }
        .hint {
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>Scan Me 📱</h2>
        <img src="${qr}" />
        <p>Scan to view a random image</p>
        <div class="hint">Scan again for a different one</div>
    </div>
</body>
</html>
        `);
    } catch (err) {
        res.status(500).send('Failed to generate QR code');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
