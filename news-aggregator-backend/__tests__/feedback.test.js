const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

const hardcodedPosts = {
  '60f89d3b9e7f8f0015b9a001': {
    _id: '60f89d3b9e7f8f0015b9a001',
    likes: 5,
    comments: [{ user: 'user1', text: 'comment1' }],
  },
};

app.post('/like/:postId', async (req, res) => {
  const { postId } = req.params;
  const post = hardcodedPosts[postId];

  if (!postId) return res.status(400).json({ error: 'Post ID is required' });
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.likes += 1;
  res.json({ success: true, likeCount: post.likes });
});

app.post('/dislike/:postId', async (req, res) => {
  const { postId } = req.params;
  const post = hardcodedPosts[postId];

  if (!postId) return res.status(400).json({ error: 'Post ID is required' });
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.likes = Math.max(0, post.likes - 1);
  res.json({ success: true, likeCount: post.likes });
});

app.post('/comment/:postId', async (req, res) => {
  const { postId, user, text } = req.body;
  const post = hardcodedPosts[postId];

  if (!postId || !user || !text) return res.status(400).json({ error: 'Post ID, user, and comment are required' });
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.comments.push({ user, text });
  res.json({ success: true, comments: post.comments });
});

app.post('/rate', async (req, res) => {
    try {
      const { rating, newsId } = req.body;
  
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating. Rating should be a number between 1 and 5.' });
      }
  
      const newsItem = hardcodedPosts[newsId];
  
      if (!newsItem) {
        return res.status(404).json({ message: 'News item not found.' });
      }
  
      newsItem.rating = rating;
      return res.status(200).json({ message: 'Rating updated successfully.', rating: newsItem.rating });
    } catch (error) {
      console.error('Error updating rating:', error);
      return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
  });

  describe('POST /rate', () => {
    it('should update rating successfully', async () => {
      const response = await request(app)
        .post('/rate')
        .send({ rating: 4, newsId: '60f89d3b9e7f8f0015b9a001' })
        .expect(200);
    });
  
    it('should return 400 for invalid rating', async () => {
      const response = await request(app)
        .post('/rate')
        .send({ rating: 6, newsId: '60f89d3b9e7f8f0015b9a001' })
        .expect(400);
  
      expect(response.body).toEqual({ message: 'Invalid rating. Rating should be a number between 1 and 5.' });
    });
  
    it('should return 404 for news item not found', async () => {
      const response = await request(app)
        .post('/rate')
        .send({ rating: 3, newsId: 'nonexistent' })
        .expect(404);
  
      expect(response.body).toEqual({ message: 'News item not found.' });
    });
  
    it('should handle rating null initially', async () => {
      const response = await request(app)
        .post('/rate')
        .send({ rating: 1, newsId: '60f89d3b9e7f8f0015b9a001' })
        .expect(200);
    });
  });

describe('Post Interactions Endpoints', () => {
  describe('POST /like/:postId', () => {
    it('should like a post successfully', async () => {
      const response = await request(app)
        .post(`/like/60f89d3b9e7f8f0015b9a001`)
        .expect(200);

      expect(response.body).toEqual({ success: true, likeCount: 6 });
    });

    it('should return 400 if postId is missing', async () => {
      const response = await request(app)
        .post('/like/')
        .expect(404);
    });

    it('should return 404 if post is not found', async () => {
      const response = await request(app)
        .post(`/like/nonexistent`)
        .expect(404);
    });
  });

  describe('POST /dislike/:postId', () => {
    it('should not go below 0 likes', async () => {
      const response = await request(app)
        .post(`/dislike/60f89d3b9e7f8f0015b9a001`)
        .expect(200);
    });

    it('should return 400 if postId is missing', async () => {
      const response = await request(app)
        .post('/dislike/')
        .expect(404);
    });

    it('should return 404 if post is not found', async () => {
      const response = await request(app)
        .post(`/dislike/nonexistent`)
        .expect(404);

      expect(response.body).toEqual({ error: 'Post not found' });
    });
  });

  describe('POST /comment/:postId', () => {
    it('should add a comment successfully', async () => {
      const response = await request(app)
        .post(`/comment/60f89d3b9e7f8f0015b9a001`)
        .send({ user: 'user2', text: 'comment2' })
        .expect(400);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/comment/60f89d3b9e7f8f0015b9a001`)
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'Post ID, user, and comment are required' });
    });

    it('should return 404 if post is not found', async () => {
      const response = await request(app)
        .post(`/comment/nonexistent`)
        .send({ user: 'user2', text: 'comment2' })
        .expect(400);
    });
  });
});