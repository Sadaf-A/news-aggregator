// registerHelper.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (email: string, password: string, confirmPassword: string) => {
  if (!email || !password || !confirmPassword) {
    throw new Error('All fields are required.');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  try {
    const response = await axios.post('https://software-e-project-123.el.r.appspot.com/register', {
      email,
      password,
    });

    if (response.status === 201) {
      const { token } = response.data;
      if (token) {
        await AsyncStorage.setItem('authToken', token);
      }
      return { success: true, message: 'Registration Successful' };
    }

    throw new Error('Registration failed.');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Something went wrong.');
  }
};
