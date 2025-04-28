require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path    = require('path');

const app = express();
const PORT = process.env.PORT;

// In-memory user store for demo:
const users = [{
    id: 1,
    username: process.env.ADMIN_USER,
    passwordHash: process.env.ADMIN_PASSWORD_HASH
}];

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { /* secure: true if HTTPS */ }
}));

// Serve your static files (login.html, certificate.html, bootstrap, etc)
app.use(express.static(path.join(__dirname, 'public')));

// Protect “/certificate.html”
function requireLogin(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login.html');
}

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.redirect('/login.html?error=1');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.redirect('/login.html?error=1');

    // 🔐 mark user as logged in
    req.session.userId = user.id;
    res.redirect('/certificate.html');
});

// Protect direct GET to certificate
app.get('/certificate.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'certificate.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
