// jwtMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('./config'); // JWT secret configuration

const jwtMiddleware = (req, res, next) => {
    // Get the token from the request header
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    // Verify the token
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }

        // Attach the decoded user to the request object
        req.user = decoded;
        next();
    });
};

module.exports = jwtMiddleware;
