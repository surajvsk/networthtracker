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
    dialect: 'postgres', // Use the correct dialect for your DB
    logging: console.log // Enables logging of SQL queries
});

const init = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.sync({ force: false });
        console.log('Tables synchronized');

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
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                try {
                    const user = await User.create({ username, email, password: hashedPassword });
                    return h.response({ message: 'User created successfully', user }).code(201);
                } catch (error) {
                    console.error('Error creating user:', error);
                    if (error.name === 'SequelizeUniqueConstraintError') {
                        return h.response({ message: 'Email already exists' }).code(409); // Conflict
                    }
                    return h.response({ message: 'Error creating user', error }).code(500);
                }
            }
        });

        await server.start();
        console.log('Server running on %s', server.info.uri);
        return server; // Return the server instance
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

