// backend/users.js
module.exports = [
    {
        id: 1,
        username: process.env.ADMIN_USER,
        // hashed password from .env
        passwordHash: process.env.ADMIN_PASSWORD_HASH
    }
];

