import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = 'https://software-e-project-123.el.r.appspot.com';

const NOTIFICATION_FREQUENCY_OPTIONS = [
  { label: 'Hourly Notifications', value: 'hourly' },
  { label: 'Daily Notifications', value: 'daily' },
  { label: 'Weekly Notifications', value: 'weekly' },
  { label: 'Opt-out of Notifications', value: 'none' }
];

export default function NotificationPreferencesScreen() {
  const [userId, setUserId] = useState('');
  const [notificationFrequency, setNotificationFrequency] = useState<string>('immediate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      loadNotificationPreferences();
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

  const loadNotificationPreferences = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/users/${userId}/notification-preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotificationFrequency(response.data.notificationFrequency || 'immediate');
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationPreferences = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return console.warn('No auth token found');
  
      if (!userId) {
        return console.warn('User ID not available');
      }
  
      await axios.put(
        `${API_BASE_URL}/update-user-notification-preference/${userId}`,
        { preference: notificationFrequency },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
  
      Alert.alert('Success', 'Your notification preferences have been saved!');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      Alert.alert('Error', 'Could not save preferences. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      <Text style={styles.description}>
        Choose how frequently you'd like to receive notifications:
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={notificationFrequency}
          style={styles.picker}
          onValueChange={(itemValue) => setNotificationFrequency(itemValue)}
        >
          {NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveNotificationPreferences}>
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  description: { fontSize: 16, color: '#555', marginBottom: 20 },
  
  pickerContainer: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#D1D1D6', 
    paddingVertical: 12, 
    paddingHorizontal: 10, 
    marginBottom: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, 
  },

  picker: {
    height: 50, 
    width: '100%',
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: '#007AFF', 
  },

  saveButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
