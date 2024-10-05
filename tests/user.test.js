const request = require('supertest');
const server = require('../server'); // Import your Hapi server here

describe('User API', () => {
    it('should create a new user', async () => {
        const response = await request(server.info.uri)
            .post('/users')
            .send({ username: 'testuser', password: 'secret', email: 'test@example.com' });

        expect(response.status).toBe(201);
        expect(response.body.user).toHaveProperty('username', 'testuser');
    });
});
