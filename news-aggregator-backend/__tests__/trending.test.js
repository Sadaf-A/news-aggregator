const request = require('supertest');
const express = require('express');
const axios = require('axios');

// Mock axios for simplicity
jest.mock('axios');

// Create a simple express app for testing
const app = express();
app.use(express.json());

// Mock database interactions (replace with your actual database logic if needed)
const posts = [];

app.get('/trending', async (req, res) => {
  try {
    const { source } = req.query;
    let articles = [];

    if (source === 'newsdataio') {
      const response = await axios.get('https://newsdata.io/api/1/news?country=us&apikey=testkey');
      articles = response.data.results || [];
    } else {
      const response = await axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=testkey');
      articles = response.data.articles || [];
    }

    for (const article of articles) {
      if (!article.url) continue;

      posts.push({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source?.name || 'Unknown',
        likes: 0,
        comments: [],
        articleId: Date.now().toString(),
        urlToImage: article.urlToImage || article.url_to_image || null,
      });
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

describe('GET /trending', () => {
  beforeEach(() => {
    posts.length = 0; // Clear posts before each test
    axios.get.mockClear();
  });

  it('should fetch news from newsapi', async () => {
    axios.get.mockResolvedValue({
      data: {
        articles: [
          { title: 'News A', description: 'Desc A', url: 'http://newsA.com', source: { name: 'Source A' }, urlToImage: 'http://imageA.com' },
          { title: 'News B', description: 'Desc B', url: 'http://newsB.com', source: { name: 'Source B' }, urlToImage: 'http://imageB.com' },
        ],
      },
    });

    const response = await request(app).get('/trending?source=newsapi').expect(200);

    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'News A' }),
      expect.objectContaining({ title: 'News B' }),
    ]));
  });

  it('should fetch news from newsdataio', async () => {
    axios.get.mockResolvedValue({
      data: {
        results: [
          { title: 'News 1', description: 'Desc 1', url: 'http://news1.com', source: { name: 'Source 1' }, url_to_image: 'http://image1.com' },
          { title: 'News 2', description: 'Desc 2', url: 'http://news2.com', source: { name: 'Source 2' }, url_to_image: 'http://image2.com' },
        ],
      },
    });

    const response = await request(app).get('/trending?source=newsdataio').expect(200);

    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'News 1' }),
      expect.objectContaining({ title: 'News 2' }),
    ]));
  });

  it('should handle API errors', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    const response = await request(app).get('/trending?source=newsapi').expect(500);

    expect(response.body).toEqual({ error: 'Failed to fetch news' });
  });

  it('should skip articles without URLs', async () => {
    axios.get.mockResolvedValue({
      data: {
        articles: [
          { title: 'News C', description: 'Desc C', source: { name: 'Source C' }, urlToImage: 'http://imageC.com' },
        ],
      },
    });

    const response = await request(app).get('/trending?source=newsapi').expect(200);

    expect(response.body).toEqual([]);
  });

  it('should handle empty responses', async () => {
      axios.get.mockResolvedValue({data: {articles: []}});
      const response = await request(app).get('/trending?source=newsapi').expect(200);
      expect(response.body).toEqual([]);
  });
});