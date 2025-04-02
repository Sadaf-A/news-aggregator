// aiChatService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = 'http://software-e-project-123.el.r.appspot.com';
const COHERE_API_URL = 'https://api.cohere.com/v2/chat';  
const COHERE_API_KEY = 'TrDL7ZuunsmneRS9JWix8B2w9EdowFv7zldMRtu5';

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('authToken');
};

export const getUserIdFromToken = async (): Promise<string | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.warn('No auth token found');
      return null;
    }

    const decodedToken: any = jwtDecode(token);
    return decodedToken.userId || null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const getUserDetails = async (userId: string): Promise<{ email: string; initial: string } | null> => {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { email: response.data.email, initial: response.data.initial };
  } catch (error) {
    console.error('Failed to load user details:', error);
    return null;
  }
};

export const sendPromptToAI = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) return 'Please enter a prompt!';

  try {
    const response = await axios.post(
      COHERE_API_URL,
      {
        model: 'command-a-03-2025',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data?.message?.content[0]?.text || 'No response from AI';
  } catch (error) {
    console.error('Error sending prompt to Cohere API:', error);
    return 'Failed to get a response from AI';
  }
};