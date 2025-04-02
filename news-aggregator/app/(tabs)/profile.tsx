import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = 'https://software-e-project-123.el.r.appspot.com';

const SUGGESTED_INTERESTS = [
  'Technology', 'Politics', 'Sports', 'Entertainment', 'Science', 
  'Health', 'Business', 'Travel', 'Food', 'Fashion', 'Art', 'Music'
];

export default function ProfileScreen() {
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [name, setName] = useState('');
  const [userInitial, setUserInitial] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
      loadUserInterests();
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

  const loadUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserEmail(response.data.email);
      setUserInitial(response.data.initial);
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  const loadUserInterests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/users/${userId}/interests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedInterests(response.data.interests || []);
    } catch (error) {
      console.error('Failed to load interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const savePreferences = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return console.warn('No auth token found');
  
      if (!userId) {
        return console.warn('User ID not available');
      }
  
      await axios.post(
        `${API_BASE_URL}/users/interests`, 
        { interests: selectedInterests },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      Alert.alert('Success', 'Your preferences have been saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Could not save preferences. Try again.');
    }
  };

  const updateUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return console.warn('No auth token found');
      
      await axios.put(
        `${API_BASE_URL}/update-user/${userId}`,
        { name, userEmail, password: password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Could not update profile. Try again.');
    }
  };

  const updateLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return console.warn('No auth token found');
      
      await axios.put(
        `${API_BASE_URL}/set-location/${userId}`,
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Location updated successfully!');
    } catch (error) {
      console.error('Failed to update location:', error);
      Alert.alert('Error', 'Could not update location. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profilePic}>
          <Text style={styles.initialText}>{userInitial}</Text>
        </View>
        <Text style={styles.emailText}>{userEmail}</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Your Interests</Text>
      <View style={styles.interestsContainer}>
        {SUGGESTED_INTERESTS.map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[
              styles.interestTag,
              selectedInterests.includes(interest) && styles.selectedInterestTag
            ]}
            onPress={() => toggleInterest(interest)}
          >
            <Text
              style={[
                styles.interestText,
                selectedInterests.includes(interest) && styles.selectedInterestText
              ]}
            >
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Edit Profile</Text>
<TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
<TextInput style={styles.input} value={userEmail} onChangeText={setUserEmail} placeholder="Email" keyboardType="email-address" />
<TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="New Password" secureTextEntry />

<TouchableOpacity style={styles.saveButton} onPress={updateUser}>
  <Text style={styles.saveButtonText}>Update Profile</Text>
</TouchableOpacity>

<Text style={styles.sectionTitle}>Set Location</Text>
<TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />
<TouchableOpacity style={styles.saveButton} onPress={updateLocation}>
  <Text style={styles.saveButtonText}>Update Location</Text>
</TouchableOpacity>
    </SafeAreaView>


  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20 },
  
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  initialText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  emailText: { fontSize: 16, fontWeight: '600', color: '#333' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  interestsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  interestTag: {
    padding: 10,
    margin: 5,
    borderRadius: 16,
    backgroundColor: '#E0E0E0'
  },
  selectedInterestTag: { backgroundColor: '#007AFF' },
  interestText: { color: '#000' },
  selectedInterestText: { color: '#FFF' },

  saveButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
