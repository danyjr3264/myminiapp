// Hapus impor langsung NeynarClient dari ESM
// import { NeynarClient } from 'https://esm.sh/@neynar/nodejs-sdk';

let client;

async function initializeNeynarClient() {
    const response = await fetch('/api/config');
    const config = await response.json();
    client = new NeynarClient({ apiKey: config.neynarApiKey });
}

async function loginWithWarpcast() {
    if (!client) await initializeNeynarClient();
    const authUrl = await client.getAuthUrl();
    window.location.href = authUrl;
}

// Sisanya sama seperti sebelumnya
function displayProfile(fid, walletAddress) {
    document.getElementById('profile').innerHTML = `
        FID: ${fid} | Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
    `;
    document.getElementById('checkInButton').disabled = false;
}

async function checkIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please log in first!');
        return;
    }

    const lastCheckIn = localStorage.getItem(`lastCheckIn_${user.fid}`);
    const now = new Date();
    if (lastCheckIn && new Date(lastCheckIn).toDateString() === now.toDateString()) {
        alert('You already checked in today!');
        return;
    }

    try {
        const response = await fetch('/api/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fid: user.fid }),
        });
        const data = await response.json();
        if (data.success) {
            alert(`Check-in successful! You earned 100 points. Total: ${data.points}`);
            localStorage.setItem(`lastCheckIn_${user.fid}`, now.toISOString());
            updateLeaderboard();
        }
    } catch (error) {
        console.error('Check-in error:', error);
        alert('Failed to check in. Try again later.');
    }
}

async function updateLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const leaderboard = await response.json();
        const leaderboardDiv = document.getElementById('leaderboard');
        leaderboardDiv.innerHTML = '<h2>Leaderboard</h2><ol>' +
            leaderboard.slice(0, 100).map(user => `<li>FID ${user.fid}: ${user.points}</li>`).join('') +
            '</ol>';
    } catch (error) {
        console.error('Leaderboard error:', error);
    }
}

document.getElementById('loginButton').addEventListener('click', loginWithWarpcast);
document.getElementById('checkInButton').addEventListener('click', checkIn);

window.onload = async () => {
    if (!client) await initializeNeynarClient();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        try {
            const user = await client.verifySignIn(token);
            const fid = user.fid;
            const walletAddress = user.custody_address;
            localStorage.setItem('user', JSON.stringify({ fid, walletAddress }));
            displayProfile(fid, walletAddress);
            updateLeaderboard();
        } catch (error) {
            console.error('Login verification error:', error);
        }
    } else {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            displayProfile(user.fid, user.walletAddress);
            updateLeaderboard();
        }
    }
};