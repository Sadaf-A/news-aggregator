import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.StyleSheet = {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style)
  };
  return RN;
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-router if you're using it
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));