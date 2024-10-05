const request = require('supertest');
const Hapi = require('@hapi/hapi');
const User = require('../models/user');
const bcrypt = require('bcrypt');

let server;

beforeAll(async () => {
    server = Hapi.server({ port: 3000 });
    server.route({
        method: 'POST',
        path: '/users',
        handler: async (request, h) => {
            const { username, email, password } = request.payload;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ username, email, password: hashedPassword });
            return h.response({ user }).code(201);
        }
    });
});

describe('POST /users', () => {
    it('should create a new user', async () => {
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        const response = await request(server)
            .post('/users')
            .send(user);

        expect(response.status).toBe(201); // Check for 201 Created
        expect(response.body).toHaveProperty('message', 'User created successfully');
    });
});
