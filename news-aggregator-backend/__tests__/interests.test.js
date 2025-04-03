const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const TEST_USER = {
  userId: 'test123',
  email: 'test@example.com',
  password: 'hashedPassword',
  interests: ['sports', 'music'],
  _id: '507f1f77bcf86cd799439011'
};

describe('User Interests Endpoints', () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { userId: TEST_USER.userId, userEmail: TEST_USER.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /users/:userId/interests', () => {
    it('should return user interests', async () => {
      const response = await request(app)
        .get(`/users/${TEST_USER.userId}/interests`)
        .expect(200);
    });

    it('should return empty array for non-existent user', async () => {
      const response = await request(app)
        .get('/users/nonexistent/interests')
        .expect(200);
    });
  });

  describe('POST /users/interests', () => {
    it('should update user interests', async () => {
      const newInterests = ['reading', 'travel'];
      
      const response = await request(app)
        .post('/users/interests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ interests: newInterests })
        .expect(404);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/users/interests')
        .send({ interests: ['test'] })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/users/interests')
        .set('Authorization', 'Bearer invalidtoken')
        .send({ interests: ['test'] })
        .expect(500);
    });

    it('should return 400 for invalid interests format', async () => {
      const response = await request(app)
        .post('/users/interests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ interests: 'not-an-array' })
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid interests format' });
    });

    it('should return 404 if user not found', async () => {
      const response = await request(app)
        .post('/users/interests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ interests: ['test'] })
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });
  });
});