import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = 'http://software-e-project-123.el.r.appspot.com';
const COHERE_API_URL = 'https://api.cohere.com/v2/chat';  
const COHERE_API_KEY = 'TrDL7ZuunsmneRS9JWix8B2w9EdowFv7zldMRtu5';

export default function AiChatScreen() {
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [prompt, setPrompt] = useState('');
  const [userInitial, setUserInitial] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

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

      setUserEmail(response.data.email);
      setUserInitial(response.data.initial);
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  const sendToAI = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt!');
      return;
    }

    try {
      const response = await axios.post(
        COHERE_API_URL,
        {
          model: 'command-a-03-2025', 
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${COHERE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aiReply = response.data?.message?.content[0]?.text || 'No response from AI';
      setAiResponse(aiReply);
      Alert.alert('AI Response', aiReply);
    } catch (error) {
      console.error('Error sending prompt to Cohere API:', error);
      Alert.alert('Error', 'Failed to get a response from AI');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profilePic}>
          <Text style={styles.initialText}>{userInitial}</Text>
        </View>
        <Text style={styles.emailText}>{userEmail}</Text>
      </View>

      <Text style={styles.sectionTitle}>Ask me anything</Text>
<TextInput style={styles.input} value={prompt} onChangeText={setPrompt} placeholder="Ask..." />
      <TouchableOpacity style={styles.saveButton} onPress={sendToAI}>
        <Text style={styles.saveButtonText}>Send</Text>
      </TouchableOpacity>

            {aiResponse ? (
        <View style={styles.aiResponseContainer}>
          <Text style={styles.aiResponseText}>AI Response: {aiResponse}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20 },
  aiResponseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  aiResponseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  initialText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  emailText: { fontSize: 16, fontWeight: '600', color: '#333' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  interestsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  interestTag: {
    padding: 10,
    margin: 5,
    borderRadius: 16,
    backgroundColor: '#E0E0E0'
  },
  selectedInterestTag: { backgroundColor: '#007AFF' },
  interestText: { color: '#000' },
  selectedInterestText: { color: '#FFF' },

  saveButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
