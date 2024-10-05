const jwt = require('jsonwebtoken');
const config = require('./config');

const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
};

module.exports = {
    generateToken,
};
