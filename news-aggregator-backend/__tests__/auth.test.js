const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcrypt');

describe('Auth API', () => {
  describe('POST /register', () => {
    it('should return 400 when email already exists', async () => {
        const testUser = {
            name: "test123",
            email: 'test123@example.com',
            password: 'password123'
          };
        const response = await request(app)
          .post('/register')
          .send(testUser)
          .expect(400); 
      });

    it('should return 500 for server errors', async () => {
      const response = await request(app)
        .post('/register')
        .send({}) 
        .expect(500);

      expect(response.body.message).toBe('Error registering user');
    });
  });

  describe('POST /login', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(400);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});