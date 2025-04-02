import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = 'https://software-e-project-123.el.r.appspot.com';

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
    if (!decodedToken.userId) {
      console.warn('No userId found in token');
      return null;
    }

    return decodedToken.userId;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const getNotificationPreferences = async (userId: string): Promise<string | null> => {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const response = await axios.get(`${API_BASE_URL}/users/${userId}/notification-preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.notificationFrequency || 'immediate';
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    return null;
  }
};

export const updateNotificationPreferences = async (userId: string, preference: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    await axios.put(
      `${API_BASE_URL}/update-user-notification-preference/${userId}`,
      { preference },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return true;
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
    return false;
  }
};
