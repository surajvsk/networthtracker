const { createServer } = require('../server'); // Import the createServer function
const User = require('../models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();

jest.mock('../models/user'); // Mock the User model

let server;

beforeAll(async () => {
    server = await createServer(); // Initialize the server
});

afterAll(async () => {
    if (server) {
        await server.stop(); // Stop the server after all tests
        console.log('Server stopped');
    }
});

describe('POST /users', () => {
    it('should create a user successfully', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
        };

        // Mock the User.create method
        User.create.mockResolvedValue(mockUser);

        const response = await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            },
        });

        expect(response.statusCode).toBe(201);
        expect(response.result.message).toBe('User created successfully');
        expect(response.result.user).toEqual(mockUser);
    });

    it('should return error when user creation fails', async () => {
        // Mock the User.create method to throw an error
        User.create.mockRejectedValue(new Error('User creation failed'));

        const response = await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            },
        });

        expect(response.statusCode).toBe(500);
        expect(response.result.message).toBe('Error creating user');
    });
});
