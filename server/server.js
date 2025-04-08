require('dotenv').config();
const express = require('express');
const path = require('path'); // Tambahkan ini untuk menangani jalur file
const app = express();

app.use(express.json());
app.use(express.static('public')); // Sajikan file dari folder public

const pointsDB = {};

// Endpoint untuk check-in
app.post('/api/checkin', (req, res) => {
    const { fid } = req.body;
    pointsDB[fid] = (pointsDB[fid] || 0) + 100;
    res.json({ success: true, points: pointsDB[fid] });
});

// Endpoint untuk leaderboard
app.get('/api/leaderboard', (req, res) => {
    const leaderboard = Object.entries(pointsDB)
        .map(([fid, points]) => ({ fid, points }))
        .sort((a, b) => b.points - a.points);
    res.json(leaderboard);
});

// Endpoint untuk memberikan API key ke frontend
app.get('/api/config', (req, res) => {
    res.json({ neynarApiKey: process.env.NEYNAR_API_KEY });
});

// Tambahkan ini: Sajikan index.html untuk semua rute yang tidak cocok
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Reset leaderboard bulanan
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