import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email: string, password: string, router: any) => {
  if (!email || !password) {
    throw new Error('Please enter email and password.');
  }

  try {
    const response = await axios.post('https://software-e-project-123.el.r.appspot.com/login', {
      email,
      password,
    });

    if (response.status === 200) {
      const { token } = response.data;
      await AsyncStorage.setItem('authToken', token); 
      return { success: true, message: 'Login Successful' };
    }

    throw new Error('Invalid credentials.');
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Login Failed');
  }
};
