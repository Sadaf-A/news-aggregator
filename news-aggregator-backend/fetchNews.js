  const axios = require('axios');
  
  async function fetchBreakingNews(interests) {
    try {
      const categoryQuery = interests.join(",");
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=business&apiKey=${process.env.NEWSAPI_KEY}`
      );
      console.log(response);
      return response.data.articles.slice(0, 5); 
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  }

  async function fetchExpiringNews() {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=breaking&sortBy=publishedAt&apiKey=${process.env.NEWSAPI_KEY}`
      );
  
      const articles = response.data.articles;
      const now = new Date();
      const expiryThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const expiringNews = articles.filter((article) => {
        const publishedAt = new Date(article.publishedAt);
        return publishedAt >= expiryThreshold;
      });
  
      return response.data.articles.slice(0, 5); 
    } catch (error) {
      console.error("Error fetching expiring news:", error);
      return [];
    }
  }

  async function fetchFeedbackNews() {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=breaking&sortBy=publishedAt&apiKey=${process.env.NEWSAPI_KEY}`
      );
  
      const articles = response.data.articles || [];
      if (articles.length === 0) return []; 
  
      const now = new Date();
      const expiryThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
      let expiringNews = articles.filter((article) => {
        const publishedAt = new Date(article.publishedAt);
        return publishedAt >= expiryThreshold;
      });
  
      if (expiringNews.length === 0) {
        expiringNews = articles.slice(0, 5);
      }
  
      return expiringNews.slice(0, 5);  
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  }

  module.exports = {fetchBreakingNews, fetchExpiringNews, fetchFeedbackNews}