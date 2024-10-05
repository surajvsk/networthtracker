// Import necessary modules
const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Sequelize } = require('sequelize');
const User = require('./models/user'); // Import your User model

// Initialize Sequelize (ensure you replace 'database', 'username', 'password' with actual values)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres' // Use the correct dialect for your DB
});

const init = async () => {
    // Sync Sequelize models
    try {
        await sequelize.authenticate(); // Test database connection
        console.log('Connection has been established successfully.');

        await sequelize.sync({ force: true }); // Synchronize models (force: true is for dev purposes)
        console.log('Models synchronized with the database.');

        const server = Hapi.server({
            port: 3000,
            host: 'localhost'
        });

        // Define routes
        server.route({
            method: 'POST',
            path: '/users',
            options: {
                validate: {
                    payload: Joi.object({
                        username: Joi.string().min(3).required(),
                        password: Joi.string().min(6).required(),
                        email: Joi.string().email().required()
                    })
                }
            },
            handler: async (request, h) => {
                const { username, password, email } = request.payload;

                // Hash the password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Create new user in the database
                const newUser = await User.create({ username, email, password: hashedPassword });

                // Return response with the created user
                return h.response({ message: 'User created successfully', user: newUser }).code(201);
            }
        });

        await server.start();
        console.log('Server running on %s', server.info.uri);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
