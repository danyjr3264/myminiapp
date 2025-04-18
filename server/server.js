require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const pointsDB = {};

// Endpoint 1: Memberikan API key Neynar untuk login
app.get('/api/config', (req, res) => {
    if (!process.env.NEYNAR_API_KEY) {
        return res.status(500).json({ error: 'Neynar API key not configured' });
    }
    res.json({ neynarApiKey: process.env.NEYNAR_API_KEY });
});

// Endpoint 2: Menangani daily check-in
app.post('/api/checkin', (req, res) => {
    const { fid } = req.body;
    if (!fid) {
        return res.status(400).json({ error: 'FID is required' });
    }
    pointsDB[fid] = (pointsDB[fid] || 0) + 100;
    res.json({ success: true, points: pointsDB[fid] });
});

// Endpoint 3: Menampilkan leaderboard
app.get('/api/leaderboard', (req, res) => {
    const leaderboard = Object.entries(pointsDB)
        .map(([fid, points]) => ({ fid, points }))
        .sort((a, b) => b.points - a.points);
    res.json(leaderboard);
});

// Fallback: Menyajikan index.html untuk semua rute lain
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'), (err) => {
        if (err) {
            res.status(500).send('Error serving index.html');
        }
    });
});

// Fungsi reset leaderboard bulanan
function resetLeaderboard() {
    const now = new Date();
    if (now.getDate() === 1 && now.getHours() === 0) {
        console.log('Resetting leaderboard...');
        for (let fid in pointsDB) pointsDB[fid] = 0;
    }
}
setInterval(resetLeaderboard, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));