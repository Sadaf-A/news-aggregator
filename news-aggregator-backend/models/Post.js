const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: { type: String, unique: true },
  source: String,
  likes: { type: Number, default: 0 },
  comments: [{ user: String, text: String, timestamp: { type: Date, default: Date.now } }],
  rating: Number,
  urlToImage: { type: String, default: null }
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);