const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const testUser = {
  userId: 'test123',
  email: 'test@example.com',
  password: 'hashedPassword',
  interests: ['sports', 'music'],
  _id: '507f1f77bcf86cd799439011'
};

const testPost = {
  _id: '507f1f77bcf86cd799439012',
  title: 'Test Post',
  content: 'Test content',
  likes: 5,
  comments: []
};

jest.mock('../models/User', () => {
  return {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  };
});

jest.mock('../models/Post', () => {
  return {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  };
});

const User = require('../models/User');
const Post = require('../models/Post');

describe('API Endpoints', () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { userId: testUser.userId, userEmail: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    User.findOne.mockImplementation((query) => {
      if ((query.userId && query.userId === testUser.userId) || 
          (query.email && query.email === testUser.email)) {
        return Promise.resolve(testUser);
      }
      return Promise.resolve(null);
    });

    User.findOneAndUpdate.mockImplementation((query, update) => {
      if (query.email === testUser.email) {
        const updatedUser = {...testUser, ...update.$set};
        return Promise.resolve(updatedUser);
      }
      return Promise.resolve(null);
    });

    Post.findById.mockImplementation((id) => {
      if (id === testPost._id) {
        return Promise.resolve({
          ...testPost,
          save: () => Promise.resolve()
        });
      }
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/:userId/interests', () => {
    it('should return user interests', async () => {
      const response = await request(app)
        .get(`/users/${testUser.userId}/interests`)
        .expect(200);

      expect(response.body).toEqual({
        interests: testUser.interests
      });
    });
  });

  describe('POST /users/interests', () => {
    it('should update user interests', async () => {
      const newInterests = ['reading', 'travel'];
      
      const response = await request(app)
        .post('/users/interests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ interests: newInterests })
        .expect(200);

      expect(response.body).toEqual({ message: 'Preferences saved successfully' });
    });
  });

  describe('POST /like/:postId', () => {
    it('should increment post likes', async () => {
      const response = await request(app)
        .post(`/like/${testPost._id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        likeCount: testPost.likes + 1
      });
    });
  });

  describe('POST /dislike/:postId', () => {
    it('should decrement post likes', async () => {
      const response = await request(app)
        .post(`/dislike/${testPost._id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        likeCount: testPost.likes - 1
      });
    });
  });

  describe('POST /comment/:postId', () => {
    it('should add comment to post', async () => {
      const commentData = {
        postId: testPost._id,
        user: testUser.userId,
        text: 'Great post!'
      };

      Post.findById.mockResolvedValueOnce({
        ...testPost,
        comments: [],
        save: () => Promise.resolve()
      });

      const response = await request(app)
        .post('/comment/' + testPost._id)
        .send(commentData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});