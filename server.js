// backend/server.js
require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const users   = require('./users');

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
    origin: 'http://localhost:3000',  // adjust if your frontend is elsewhere
    credentials: true
}));
app.use(express.json());

// → POST /api/login { username, password }
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Issue a JWT
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '4h' });
    res.json({ token });
});

// Middleware to protect routes
function requireAuth(req, res, next) {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.sub;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// → GET /api/certificate?name=…  (protected)
app.get('/api/certificate', requireAuth, (req, res) => {
    const name = req.query.name || '—';
    res.json({
        name,
        date: new Date().toLocaleDateString('en-GB', {
            year:'numeric', month:'long', day:'numeric'
        })
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
