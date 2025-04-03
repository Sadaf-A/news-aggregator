const {
    fetchBreakingNews,
    fetchExpiringNews,
    fetchFeedbackNews
  } = require('../fetchNews.js'); 
  const axios = require('axios');

  describe('News API Functions', () => {

    const mockArticles = [
      { 
        title: 'News 1', 
        publishedAt: new Date().toISOString(),
        content: 'Content 1'
      },
      { 
        title: 'News 2', 
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        content: 'Content 2'
      },
      { 
        title: 'News 3', 
        publishedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        content: 'Content 3'
      }
    ];
  
    const originalAxiosGet = axios.get;
    
    beforeAll(() => {
      axios.get = jest.fn((url) => {
        if (url.includes('top-headlines')) {
          return Promise.resolve({
            data: {
              articles: mockArticles.slice(0, 2) 
            }
          });
        }
        else if (url.includes('everything')) {
          return Promise.resolve({
            data: {
              articles: mockArticles 
            }
          });
        }
        return Promise.reject(new Error('Invalid URL'));
      });
    });
  
    afterAll(() => {
      axios.get = originalAxiosGet; 
    });
  
    describe('fetchBreakingNews', () => {
      it('should return first 5 articles from business category', async () => {
        const interests = ['business'];
        const result = await fetchBreakingNews(interests);
        
        expect(result).toHaveLength(2);
        expect(result[0].title).toBe('News 1');
        expect(result[1].title).toBe('News 2');
      });
    });
  
    describe('fetchExpiringNews', () => {
      it('should return articles from last 24 hours', async () => {
        const result = await fetchExpiringNews();
        
        expect(result).toHaveLength(3); 
        expect(result[0].title).toBe('News 1');
        expect(result[1].title).toBe('News 2');
      });
    });
  
    describe('fetchFeedbackNews', () => {
      it('should return recent articles with fallback to any news', async () => {
        const result = await fetchFeedbackNews();

        expect(result).toHaveLength(2);
        expect(result[1].title).toBe('News 2');
      });
  
      it('should handle empty response from API', async () => {

        const originalGet = axios.get;
        axios.get = jest.fn(() => Promise.resolve({ data: { articles: [] } }));
        
        const result = await fetchFeedbackNews();
        expect(result).toEqual([]);
        
        axios.get = originalGet;
      });
    });
  });