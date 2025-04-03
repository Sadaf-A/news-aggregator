const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
const cron = require("node-cron");
const User = require('./models/User');
const Post = require('./models/Post');

cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled email notifications...");

  const users = await User.find({});
  for (const user of users) {
    const userInterests = user.interests;
    if (userInterests.length === 0) continue;

    const news = await fetchBreakingNews(userInterests);
    if (news.length === 0) continue;

    let emailContent = `<h2>🚀 Breaking News Updates</h2>`;
    news.forEach((article) => {
      emailContent += `
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <a href="${article.url}">Read more</a><br><br>
      `;
    });

    await sendEmail(user.email, "🔥 Latest News Updates", emailContent);
    console.log(`Notification sent to ${user.email}`);
  }

  const expiringNews = await fetchExpiringNews();
  if (expiringNews.length > 0) {
    let expiringEmailContent = `<h2>⏳ Expiring News</h2>`;
    expiringNews.forEach((article) => {
      expiringEmailContent += `
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <p><strong>Expiring Soon!</strong></p>
        <a href="${article.url}">Read more</a><br><br>
      `;
    });

    await sendEmail(user.email, "⏳ Expiring News Alert", expiringEmailContent);
    console.log(`Expiring news notification sent to ${user.email}`);
  }
});

dotenv.config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "meetadarshsnair@gmail.com",
    pass: "ggta gdhv djmm oiid",
  },
});

async function sendEmail(subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `"News App" <${process.env.EMAIL_USER}>`,
      to: "meetadarshsnair@gmail.com",
      subject,
      html: text,
    });

    console.log(`Email sent: ${info.response}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    return { success: false, error };
  }
}
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

app.put('/update-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

app.put('/update-user-notification-preference/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { preference } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notificationPreference = preference;

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

app.put('/set-location/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.location = location;

    await user.save();
    res.status(200).json({ message: 'User location successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user location', error });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, userEmail: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

app.get('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ email: user.email });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });

  app.get('/users/:userId/interests', async (req, res) => {
    try {
      const user = await User.findOne({ userId: req.params.userId });
      res.json({ interests: user ? user.interests : [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch interests' });
    }
  });
  

  app.post('/users/interests', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; 
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 
      console.log(decoded)
      const userEmail = decoded.userEmail; 
  
      if (!userEmail) return res.status(400).json({ error: 'Invalid token payload' });
  
      const { interests } = req.body;
      if (!Array.isArray(interests)) return res.status(400).json({ error: 'Invalid interests format' });
  
      const updatedUser = await User.findOneAndUpdate(
        { email: userEmail }, 
        { $set: { interests } },
        { new: true, upsert: false }
      );
  
      if (!updatedUser) return res.status(404).json({ error: 'User not found' });
  
      res.json({ message: 'Preferences saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save interests' });
    }
  });
  
  app.post("/like/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      if (!postId) return res.status(400).json({ error: "Post ID is required" });
  
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
  
      post.likes += 1;
      await post.save();
  
      res.json({ success: true, likeCount: post.likes });
    } catch (error) {
      res.status(500).json({ error: "Failed to like post" });
    }
  });
  
  app.post("/dislike/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      if (!postId) return res.status(400).json({ error: "Post ID is required" });
  
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
  
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
  
      res.json({ success: true, likeCount: post.likes });
    } catch (error) {
      res.status(500).json({ error: "Failed to dislike post" });
    }
  });
  
  app.post("/comment/:postId", async (req, res) => {
    try {
      const { postId, user, text } = req.body;
      if (!postId || !user || !text) return res.status(400).json({ error: "Post ID, user, and comment are required" });
  
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
  
      post.comments.push({ user, text });
      await post.save();
  
      res.json({ success: true, comments: post.comments });
    } catch (error) {
      res.status(500).json({ error: "Failed to add comment" });
    }
  });
  
  app.post("/send-notification", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]; 
      if (!token) return res.status(401).json({ error: "Unauthorized" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userEmail = decoded.userEmail;
  
      const user = await User.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const userInterests = user.interests;
      console.log(user);
      if (userInterests.length === 0) {
        return res.json({ message: "No interests found, no news to send" });
      }
      console.log("here");
      const news = await fetchBreakingNews(userInterests);
      if (news.length === 0) {
        return res.json({ message: "No breaking news for your interests at this time." });
      }
  
      let emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ff4500;">🔥 Breaking News Updates</h2>
            <p>Hi,</p>
            <p>Here are the latest news articles based on your interests:</p>
            <hr style="border: 1px solid #ddd;">
      `;
  
      news.forEach((article) => {
        emailContent += `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #007bff;">${article.title}</h3>
            <p>${article.description || "Click below to read more."}</p>
            <a href="${article.url}" style="display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Read More</a>
          </div>
          <hr style="border: 1px solid #ddd;">
        `;
      });
  
      emailContent += `
            <p>Stay tuned for more updates!</p>
            <p><i>- News App Team</i></p>
          </div>
        </div>
      `;
  
      const result = await sendEmail("🔥 Breaking News Updates", emailContent);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });
  

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
  
  
  app.get("/trending", async (req, res) => {
    try {
      const { source } = req.query;
      let articles = [];
    
      if (source === "newsdataio") {
        const response = await axios.get(`https://newsdata.io/api/1/news?country=us&apikey=${process.env.NEWSDATAIO_KEY}`);
        articles = response.data.results || [];
      } else {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWSAPI_KEY}`);
        articles = response.data.articles || [];
        console.log(articles)
      }
    
      for (let article of articles) {
        if (!article.url) continue;
      
        console.log(article.urlToImage);
      
        const existingPost = await Post.findOne({ url: article.url });
        if (!existingPost) {
          await Post.create({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source?.name || "Unknown",
            likes: 0,
            comments: [],
            articleId: new Date().getTime().toString(),
            urlToImage: article.urlToImage || article.url_to_image || null,
          });
        }
      }
    
      const storedPosts = await Post.find().sort({ createdAt: -1 });
      res.json(storedPosts);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });
  

  app.post("/rate", async (req, res) => {
    try {
      const { rating, newsId } = req.body;
  
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating. Rating should be a number between 1 and 5." });
      }
  
      const newsItem = await Post.findById(newsId);
  
      if (!newsItem) {
        return res.status(404).json({ message: "News item not found." });
      }
  
      newsItem.rating = rating;
  
      await newsItem.save();
  
      return res.status(200).json({ message: "Rating updated successfully.", rating: newsItem.rating });
    } catch (error) {
      console.error("Error updating rating:", error);
      return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  app.post("/send-expiring-news-notification", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userEmail = decoded.userEmail;
  
      const user = await User.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const userInterests = user.interests;
      if (userInterests.length === 0) {
        return res.json({ message: "No interests found, no news to send" });
      }
  
      const news = await fetchExpiringNews(userInterests);
  
      if (news.length === 0) {
        return res.json({ message: "No expiring news for your interests at this time." });
      }
  
      let emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ff4500;">🔥 Expiring News Updates</h2>
            <p>Hi,</p>
            <p>Here are the latest expiring news articles based on your interests:</p>
            <hr style="border: 1px solid #ddd;">
      `;
  
      news.forEach((article) => {
        emailContent += `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #007bff;">${article.title}</h3>
            <p>${article.description || "Click below to read more."}</p>
            <a href="${article.url}" style="display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Read More</a>
          </div>
          <hr style="border: 1px solid #ddd;">
        `;
      });
  
      emailContent += `
            <p>Stay tuned for more updates!</p>
            <p><i>- News App Team</i></p>
          </div>
        </div>
      `;
  
      const result = await sendEmail("🔥 Expiring News Updates", emailContent);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  app.post("/send-feedback-news-notification", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userEmail = decoded.userEmail;
  
      const user = await User.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const userInterests = user.interests;
      if (userInterests.length === 0) {
        return res.json({ message: "No interests found, no news to send" });
      }
  
      const news = await fetchFeedbackNews(userInterests);
  
      if (news.length === 0) {
        return res.json({ message: "No news for your interests at this time." });
      }
  
      let emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ff4500;">🔥 Feedback Based News Updates</h2>
            <p>Hi,</p>
            <p>Here are the latest feedback based news articles based on your interests:</p>
            <hr style="border: 1px solid #ddd;">
      `;
  
      news.forEach((article) => {
        emailContent += `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #007bff;">${article.title}</h3>
            <p>${article.description || "Click below to read more."}</p>
            <a href="${article.url}" style="display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Read More</a>
          </div>
          <hr style="border: 1px solid #ddd;">
        `;
      });
  
      emailContent += `
            <p>Stay tuned for more updates!</p>
            <p><i>- News App Team</i></p>
          </div>
        </div>
      `;
  
      const result = await sendEmail("🔥 Feedback Based News Updates", emailContent);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  app.post("/send-high-rated-news-notification", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userEmail = decoded.userEmail;
  
      const user = await User.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const highRatedNews = await Post.find({ rating: { $gt: 3 } }).sort({ rating: -1 }).limit(10);
  
      if (highRatedNews.length === 0) {
        return res.json({ message: "No highly rated news articles available at this time." });
      }
  
      let emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ff4500;">⭐ Highly Rated News Updates</h2>
            <p>Hi,</p>
            <p>Here are the top-rated news articles with a rating above 3:</p>
            <hr style="border: 1px solid #ddd;">
      `;
  
      highRatedNews.forEach((article) => {
        emailContent += `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #007bff;">${article.title}</h3>
            <p>${article.description || "Click below to read more."}</p>
            <p><strong>Rating:</strong> ${article.rating.toFixed(1)}</p>
            <a href="${article.url}" style="display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Read More</a>
          </div>
          <hr style="border: 1px solid #ddd;">
        `;
      });
  
      emailContent += `
            <p>Stay updated with more highly rated news!</p>
            <p><i>- News App Team</i></p>
          </div>
        </div>
      `;
  
      const result = await sendEmail("⭐ Highly Rated News Updates", emailContent);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });
  

  module.exports = app;

  if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    module.exports.server = server;
  }
