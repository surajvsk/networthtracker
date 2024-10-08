const Hapi = require('@hapi/hapi');
const User = require('./models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const HapiAuthJwt2 = require('hapi-auth-jwt2');
const { generateToken } = require('./utils');
const config = require('./config');

const createServer = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    });

    // Register JWT authentication
    await server.register(HapiAuthJwt2);

    server.auth.strategy('jwt', 'jwt', {
        key: config.jwtSecret,
        validate: async (decoded) => {
            // Additional validation can be done here
            return { isValid: true };
        },
    });

    server.auth.default('jwt'); // Set the default authentication strategy

    // Routes for user creation and login
    server.route({
        method: 'POST',
        path: '/users',
        options: {
            validate: {
                payload: Joi.object({
                    username: Joi.string().min(3).required(),
                    password: Joi.string().min(6).required(),
                    email: Joi.string().email().required(),
                }),
            },
        },
        handler: async (request, h) => {
            const { username, password, email } = request.payload;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            try {
                const user = await User.create({ username, email, password: hashedPassword });
                return h.response({ message: 'User created successfully', user }).code(201);
            } catch (error) {
                return h.response({ message: 'Error creating user', error }).code(500);
            }
        },
    });

    server.route({
        method: 'POST',
        path: '/login',
        options: {
            auth: false, // No JWT authentication for login
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().min(6).required(),
                }),
            },
        },
        handler: async (request, h) => {
            const { email, password } = request.payload;

            // Find user by email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return h.response({ message: 'User not found' }).code(404);
            }

            // Compare passwords
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return h.response({ message: 'Invalid password' }).code(401);
            }

            // Generate and return JWT token
            const token = generateToken(user);
            return h.response({ token }).code(200);
        },
    });

    // Protected route example
    server.route({
        method: 'GET',
        path: '/protected',
        options: {
            auth: 'jwt', // Require JWT authentication
        },
        handler: (request, h) => {
            return h.response({ message: 'You have accessed protected data!', user: request.auth.credentials });
        },
    });

    return server;
};

// Only start the server if not in a test environment
if (process.env.NODE_ENV !== 'test') {
    (async () => {
        const server = await createServer();
        await server.start();
        console.log('Server running on %s', server.info.uri);
    })();
}

module.exports = { createServer }; // Export the server creation function
