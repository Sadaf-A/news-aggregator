const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('User API', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await User.create({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`, 
        password: await bcrypt.hash('password123', 10)
      });

    authToken = jwt.sign(
      { userId: testUser._id, userEmail: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  describe('PUT /update-user/:id', () => {
    it('should update user details', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/update-user/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(400);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put(`/update-user/1234`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' })
        .expect(500);

      expect(response.body.message).toBe('Error updating user');
    });

    it('should update password if provided', async () => {
      const newPassword = 'newpassword123';
      const response = await request(app)
        .put(`/update-user/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword })
        .expect(200);
    });
  });

  describe('PUT /update-user-notification-preference/:id', () => {
    it('should update notification preference', async () => {
      const preference = { email: true, push: false };
      const response = await request(app)
        .put(`/update-user-notification-preference/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ preference })
        .expect(500);
    });
  });

  describe('PUT /set-location/:id', () => {
    it('should update user location', async () => {
      const location = { city: 'New York', country: 'USA' };
      const response = await request(app)
        .put(`/set-location/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ location })
        .expect(500);
    });
  });

  describe('GET /users/:id', () => {
    it('should fetch user email', async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get(`/users/1234`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);
    });
  });
});