import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  getAuthToken,
  getUserIdFromToken,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../notificationFn';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('jwt-decode');

describe('Notification Preferences Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAuthToken should return token from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mocked_token');

    const token = await getAuthToken();
    expect(token).toBe('mocked_token');
  });

  test('getUserIdFromToken should return userId when token is valid', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mocked_token');
    (jwtDecode as jest.Mock).mockReturnValue({ userId: '12345' });

    const userId = await getUserIdFromToken();
    expect(userId).toBe('12345');
  });

  test('getUserIdFromToken should return null if token is missing', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const userId = await getUserIdFromToken();
    expect(userId).toBeNull();
  });

  test('getNotificationPreferences should return notification preference', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mocked_token');
    (axios.get as jest.Mock).mockResolvedValue({ data: { notificationFrequency: 'daily' } });

    const preference = await getNotificationPreferences('12345');
    expect(preference).toBe('daily');
  });

  test('getNotificationPreferences should return "immediate" if API does not return data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mocked_token');
    (axios.get as jest.Mock).mockResolvedValue({ data: {} });

    const preference = await getNotificationPreferences('12345');
    expect(preference).toBe('immediate');
  });

  test('updateNotificationPreferences should return true when API call is successful', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mocked_token');
    (axios.put as jest.Mock).mockResolvedValue({});

    const result = await updateNotificationPreferences('12345', 'weekly');
    expect(result).toBe(true);
  });

  test('updateNotificationPreferences should return false if API call fails', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mocked_token');
    (axios.put as jest.Mock).mockRejectedValue(new Error('API error'));

    const result = await updateNotificationPreferences('12345', 'weekly');
    expect(result).toBe(false);
  });
});
