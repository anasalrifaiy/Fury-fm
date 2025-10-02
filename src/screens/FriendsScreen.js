import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const FriendsScreen = () => {
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const currentUser = auth().currentUser;
    const snapshot = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('friends')
      .get();
    
    const friendsList = [];
    for (const doc of snapshot.docs) {
      const friendData = doc.data();
      const friendDoc = await firestore()
        .collection('users')
        .doc(friendData.friendId)
        .get();
      
      if (friendDoc.exists) {
        const friendUser = friendDoc.data();
        friendsList.push({
          id: doc.id,
          friendId: friendData.friendId,
          ...friendUser
        });
      }
    }
    setFriends(friendsList);
  };

  const addFriend = async () => {
    if (!friendEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    try {
      const usersSnapshot = await firestore()
        .collection('users')
        .where('email', '==', friendEmail)
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        Alert.alert('Not Found', 'User not found with this email');
        return;
      }
      
      const friendDoc = usersSnapshot.docs[0];
      const friendId = friendDoc.id;
      
      if (friendId === auth().currentUser.uid) {
        Alert.alert('Error', "You can't add yourself as a friend!");
        return;
      }
      
      // Check if already friends
      const existingFriend = await firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .collection('friends')
        .where('friendId', '==', friendId)
        .get();
      
      if (!existingFriend.empty) {
        Alert.alert('Already Friends', 'You are already friends with this user');
        return;
      }
      
      // Add friend to both users
      await firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .collection('friends')
        .add({
          friendId: friendId,
          addedAt: firestore.FieldValue.serverTimestamp()
        });
      
      await firestore()
        .collection('users')
        .doc(friendId)
        .collection('friends')
        .add({
          friendId: auth().currentUser.uid,
          addedAt: firestore.FieldValue.serverTimestamp()
        });
      
      setFriendEmail('');
      Alert.alert('Success', 'Friend added successfully!');
      loadFriends();
      
    } catch (error) {
      Alert.alert('Error', 'Failed to add friend');
    }
  };

  const challengeFriend = async (friend) => {
    Alert.alert(
      'Challenge Friend',
      `Challenge ${friend.name} to a match?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Challenge',
          onPress: async () => {
            // Create challenge in Firebase
            await firestore().collection('challenges').add({
              challenger: auth().currentUser.uid,
              challenged: friend.friendId,
              status: 'pending',
              createdAt: firestore.FieldValue.serverTimestamp()
            });
            
            Alert.alert('Challenge Sent', 'Your friend has been notified!');
          }
        }
      ]
    );
  };

  const renderFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.avatarText}>
          {item.name ? item.name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendClub}>{item.clubName}</Text>
        <Text style={styles.friendStats}>
          Level {item.level || 1} • {item.trophies || 0} 🏆
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.challengeButton}
        onPress={() => challengeFriend(item)}
      >
        <Text style={styles.challengeText}>Challenge</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.addFriendSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter friend's email"
          value={friendEmail}
          onChangeText={setFriendEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={addFriend}>
          <Text style={styles.addButtonText}>Add Friend</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>Add friends to challenge them!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addFriendSection: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 15,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  friendClub: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  friendStats: {
    fontSize: 12,
    color: '#999',
  },
  challengeButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  challengeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default FriendsScreen;