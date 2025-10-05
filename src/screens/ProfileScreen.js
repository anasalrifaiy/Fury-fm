import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { DEFAULT_BALANCE } from '../data/playersDatabase';

const ProfileScreen = () => {
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [managerName, setManagerName] = useState('');
  const [clubName, setClubName] = useState('');

  useEffect(() => {
    loadUserData();

    // Add focus listener to refresh data when tab is focused
    const interval = setInterval(() => {
      if (global.userBalance !== userData.coins) {
        loadUserData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userData.coins]);

  const loadUserData = async () => {
    // Mock user data with global balance sync
    const mockUserData = {
      name: 'John Manager',
      clubName: 'My Football Club',
      level: 1,
      coins: global.userBalance || DEFAULT_BALANCE,
      trophies: 0,
      matches: 5,
      wins: 3,
      draws: 1,
      losses: 1,
      email: 'manager@example.com'
    };

    // Initialize global balance if not set
    if (!global.userBalance) {
      global.userBalance = mockUserData.coins;
    } else {
      mockUserData.coins = global.userBalance;
    }

    setUserData(mockUserData);
    setManagerName(mockUserData.name);
    setClubName(mockUserData.clubName);
  };

  const updateProfile = async () => {
    try {
      const currentUser = auth().currentUser;
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          name: managerName,
          clubName: clubName,
        });
      
      setUserData({ ...userData, name: managerName, clubName: clubName });
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const selectImage = () => {
    // Mock image picker since Firebase storage isn't set up
    Alert.alert(
      'Profile Picture',
      'Profile picture selection is not available in demo mode.\n\nIn the full version, you could:\n• Take a photo with camera\n• Choose from photo library\n• Upload to cloud storage',
      [
        { text: 'OK', style: 'default' }
      ]
    );

    // For demo purposes, you could set a mock image
    // setUserData({ ...userData, profileImage: 'https://via.placeholder.com/100' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => auth().signOut() }
      ]
    );
  };

  const winRate = userData.matches > 0 
    ? Math.round((userData.wins / userData.matches) * 100) 
    : 0;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={selectImage} style={styles.avatarContainer}>
          {userData.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Text>📷</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.clubName}>{userData.clubName}</Text>
        <Text style={styles.level}>Level {userData.level || 1} Manager</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.matches || 0}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.wins || 0}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>

      <View style={styles.editSection}>
        {editMode ? (
          <>
            <TextInput
              style={styles.input}
              value={managerName}
              onChangeText={setManagerName}
              placeholder="Manager Name"
            />
            <TextInput
              style={styles.input}
              value={clubName}
              onChangeText={setClubName}
              placeholder="Club Name"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={updateProfile}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.editButton]}
            onPress={() => setEditMode(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceValue}>💰 ${(userData.coins || DEFAULT_BALANCE).toLocaleString()}</Text>
        <Text style={styles.trophiesValue}>🏆 {userData.trophies || 0} Trophies</Text>
      </View>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 50,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  clubName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  level: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  editSection: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#667eea',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    flex: 1,
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    flex: 1,
    marginRight: 5,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  balanceSection: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  trophiesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f39c12',
  },
});

export default ProfileScreen;