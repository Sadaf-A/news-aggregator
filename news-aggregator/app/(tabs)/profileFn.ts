import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://software-e-project-123.el.r.appspot.com';

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('authToken');
};

export const getUserProfile = async (): Promise<{ userId: string } | null> => {
  const token = await getAuthToken();
  if (!token) return null;

  const decodedToken: any = JSON.parse(atob(token.split('.')[1])); // Decoding JWT
  return decodedToken?.userId ? { userId: decodedToken.userId } : null;
};

export const fetchUserDetails = async (userId: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const fetchUserInterests = async (userId: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  const response = await axios.get(`${API_BASE_URL}/users/${userId}/interests`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.interests || [];
};

export const saveUserInterests = async (userId: string, interests: string[]) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  await axios.post(
    `${API_BASE_URL}/users/interests`,
    { interests },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updateUserProfile = async (userId: string, name: string, email: string, password?: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  await axios.put(
    `${API_BASE_URL}/update-user/${userId}`,
    { name, email, password: password || undefined },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updateUserLocation = async (userId: string, location: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error('No auth token found');

  await axios.put(
    `${API_BASE_URL}/set-location/${userId}`,
    { location },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
