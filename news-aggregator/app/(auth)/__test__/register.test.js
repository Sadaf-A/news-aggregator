import { register } from '../registerFN';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');

describe('register function', () => {
  it('should register successfully and return success message', async () => {
    const mockToken = 'fake-token';
    axios.post.mockResolvedValueOnce({ status: 201, data: { token: mockToken } });
    AsyncStorage.setItem.mockResolvedValueOnce();

    const result = await register('test@example.com', 'password123', 'password123');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Registration Successful');
    expect(axios.post).toHaveBeenCalledWith(
      'https://software-e-project-123.el.r.appspot.com/register',
      { email: 'test@example.com', password: 'password123' }
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
  });

  it('should throw an error when password is too short', async () => {
    await expect(register('test@example.com', 'short', 'short')).rejects.toThrowError('Password must be at least 6 characters.');
  });

  it('should throw an error when passwords do not match', async () => {
    await expect(register('test@example.com', 'password123', 'password124')).rejects.toThrowError('Passwords do not match.');
  });

  it('should throw an error when registration fails', async () => {
    const errorMessage = 'Something went wrong.';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    await expect(register('test@example.com', 'password123', 'password123'))
      .rejects
      .toThrowError(errorMessage);
  });

  it('should throw an error when email or password is missing', async () => {
    await expect(register('', 'password123', 'password123')).rejects.toThrowError('All fields are required.');
    await expect(register('test@example.com', '', 'password123')).rejects.toThrowError('All fields are required.');
    await expect(register('test@example.com', 'password123', '')).rejects.toThrowError('All fields are required.');
  });
});
