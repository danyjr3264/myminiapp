require('dotenv').config(); // Tambahkan di atas
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('../public'));

const pointsDB = {};

app.post('/api/checkin', (req, res) => {
    const { fid } = req.body;
    pointsDB[fid] = (pointsDB[fid] || 0) + 100;
    res.json({ success: true, points: pointsDB[fid] });
});

app.get('/api/leaderboard', (req, res) => {
    const leaderboard = Object.entries(pointsDB)
        .map(([fid, points]) => ({ fid, points }))
        .sort((a, b) => b.points - a.points);
    res.json(leaderboard);
});

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