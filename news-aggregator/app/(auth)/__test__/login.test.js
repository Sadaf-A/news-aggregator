// loginHelper.test.ts
import { login } from '../loginFn';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');

describe('login function', () => {
  it('should login successfully and return success message', async () => {
    const mockRouter = { replace: jest.fn() };
    const mockToken = 'fake-token';
    axios.post.mockResolvedValueOnce({ status: 200, data: { token: mockToken } });
    AsyncStorage.setItem.mockResolvedValueOnce();

    const result = await login('test@example.com', 'password', mockRouter);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Login Successful');
    expect(axios.post).toHaveBeenCalledWith(
      'https://software-e-project-123.el.r.appspot.com/login',
      { email: 'test@example.com', password: 'password' }
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
  });

  it('should throw an error when login fails', async () => {
    const mockRouter = { replace: jest.fn() };
    const errorMessage = 'Login Failed';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    await expect(login('test@example.com', 'wrongpassword', mockRouter))
      .rejects
      .toThrowError(errorMessage);

    expect(axios.post).toHaveBeenCalledWith(
      'https://software-e-project-123.el.r.appspot.com/login',
      { email: 'test@example.com', password: 'wrongpassword' }
    );
  });

  it('should throw error when email or password is missing', async () => {
    const mockRouter = { replace: jest.fn() };

    await expect(login('', 'password', mockRouter)).rejects.toThrowError('Please enter email and password.');
    await expect(login('test@example.com', '', mockRouter)).rejects.toThrowError('Please enter email and password.');
  });
});
