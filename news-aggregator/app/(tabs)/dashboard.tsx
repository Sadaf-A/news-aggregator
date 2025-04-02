import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import FontAwesome from '@expo/vector-icons/build/FontAwesome';

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  source: string;
  likes: number;
  comments: string[];
  rating: number;
}

const API_BASE_URL = 'https://software-e-project-123.el.r.appspot.com';

export default function TrendingScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiSource, setApiSource] = useState<'newsapi' | 'newsdataio'>('newsapi');
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  useEffect(() => {
    loadNews();
  }, [apiSource]);

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return console.warn('No auth token found');

      const decodedToken: any = jwtDecode(token);
      if (!decodedToken.userId) return console.warn('No userId found in token');

      setUserId(decodedToken.userId);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  const handleRating = async (rating: number, itemId: string) => {
    try {
      setNews(prevNews =>
        prevNews.map(newsItem =>
          newsItem._id === itemId ? { ...newsItem, rating } : newsItem
        )
      );

      await axios.post(`https://software-e-project-123.el.r.appspot.com/rate`, { rating, itemId });
    } catch (error) {
      console.error('Error rating the news item:', error);
    }
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://software-e-project-123.el.r.appspot.com/trending?source=${apiSource}`);
      setNews(Array.isArray(response.data) ? response.data : response.data.articles || []);
    } catch (error) {
      console.error(`Failed to load news:`, error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApiSource = () => {
    setApiSource(prev => (prev === 'newsapi' ? 'newsdataio' : 'newsapi'));
  };

  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.toggleButton} onPress={toggleApiSource}>
        <Text style={styles.toggleButtonText}>Switch to {apiSource === 'newsapi' ? 'newsdataio' : 'newsapi'}</Text>
      </TouchableOpacity>
      <FlatList
        data={news}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star, item._id)}>
                  <FontAwesome
                    name={star <= item.rating ? 'star' : 'star-o'}
                    size={24}
                    color={star <= item.rating ? '#FFD700' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentInput[item._id] || ''}
              onChangeText={(text) => setCommentInput(prev => ({ ...prev, [item._id]: text }))}
            />
            <TouchableOpacity style={styles.submitButton}>
              <Send size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  card: { backgroundColor: 'white', padding: 10, borderRadius: 5, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  source: { fontSize: 12, color: 'gray' },
  description: { fontSize: 14, marginTop: 5 },
  commentInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 8, marginTop: 10 },
  submitButton: { alignSelf: 'flex-end', marginTop: 5 },
  toggleButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  toggleButtonText: { color: 'white', fontWeight: 'bold' },
  starRating: { flexDirection: 'row', marginTop: 10 },
});
