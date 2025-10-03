// Web Firebase Firestore database services using mocks
import firestore from '../web-mocks/firebase-firestore';

const db = firestore();

// User Profile Operations
export const createUserProfile = async (userId, profileData) => {
  try {
    await db.collection('users').doc(userId).set({
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return { success: true, data: userDoc.data() };
    } else {
      // Check for existing data with old storage keys and migrate
      const legacyKeys = [
        `user_${userId}`,
        `userProfile_${userId}`,
        `profile_${userId}`,
        userId
      ];

      for (const key of legacyKeys) {
        try {
          const legacyData = localStorage.getItem(key);
          if (legacyData) {
            const parsedData = JSON.parse(legacyData);
            console.log(`Migrating user data from legacy key: ${key}`);

            // Migrate the data to the new format
            await db.collection('users').doc(userId).set({
              ...parsedData,
              updatedAt: new Date().toISOString()
            });

            // Remove the legacy key
            localStorage.removeItem(key);

            return { success: true, data: parsedData };
          }
        } catch (parseError) {
          console.warn(`Error parsing legacy data for key ${key}:`, parseError);
        }
      }

      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    await db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Squad Operations
export const saveUserSquad = async (userId, squadData) => {
  try {
    await db.collection('squads').doc(userId).set({
      squad: squadData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserSquad = async (userId) => {
  try {
    const squadDoc = await db.collection('squads').doc(userId).get();
    if (squadDoc.exists) {
      return { success: true, data: squadDoc.data().squad };
    } else {
      // Check for existing squad data with old storage keys and migrate
      const legacyKeys = [
        `squad_${userId}`,
        `userSquad_${userId}`,
        `${userId}_squad`
      ];

      for (const key of legacyKeys) {
        try {
          const legacyData = localStorage.getItem(key);
          if (legacyData) {
            const parsedData = JSON.parse(legacyData);
            console.log(`Migrating squad data from legacy key: ${key}`);

            // Migrate the squad data to the new format
            await db.collection('squads').doc(userId).set({
              squad: parsedData,
              updatedAt: new Date().toISOString()
            });

            // Remove the legacy key
            localStorage.removeItem(key);

            return { success: true, data: parsedData };
          }
        } catch (parseError) {
          console.warn(`Error parsing legacy squad data for key ${key}:`, parseError);
        }
      }

      return { success: false, error: 'Squad not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Friends System
export const sendFriendRequest = async (fromUserId, toUserId, fromUserName) => {
  try {
    await db.collection('friendRequests').add({
      from: fromUserId,
      to: toUserId,
      fromName: fromUserName,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFriendRequests = async (userId) => {
  try {
    const snapshot = await db.collection('friendRequests').get();
    const requests = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.to === userId && data.status === 'pending') {
        requests.push({ id: doc.id, ...data });
      }
    });

    // If no requests found in new format, check for legacy data
    if (requests.length === 0) {
      const legacyKeys = [
        `friendRequests_${userId}`,
        `pendingFriendRequests_${userId}`,
        `${userId}_friendRequests`
      ];

      for (const key of legacyKeys) {
        try {
          const legacyData = localStorage.getItem(key);
          if (legacyData) {
            const parsedData = JSON.parse(legacyData);
            console.log(`Migrating friend requests from legacy key: ${key}`);

            // Migrate friend requests data
            if (Array.isArray(parsedData)) {
              for (const request of parsedData) {
                if (request.status === 'pending') {
                  // Create friend request in new format
                  const docRef = await db.collection('friendRequests').add({
                    from: request.from,
                    to: userId,
                    fromName: request.fromName || 'Unknown',
                    status: 'pending',
                    createdAt: request.createdAt || new Date().toISOString()
                  });
                  requests.push({ id: docRef.id, ...request });
                }
              }
            }

            // Remove the legacy key
            localStorage.removeItem(key);
            break; // Exit after first successful migration
          }
        } catch (parseError) {
          console.warn(`Error parsing legacy friend requests for key ${key}:`, parseError);
        }
      }
    }

    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const acceptFriendRequest = async (requestId, userId, friendId) => {
  try {
    // Update request status
    await db.collection('friendRequests').doc(requestId).update({
      status: 'accepted',
      updatedAt: new Date().toISOString()
    });

    // Add to both users' friends lists
    await db.collection('friends').add({
      user1: userId,
      user2: friendId,
      createdAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserFriends = async (userId) => {
  try {
    const snapshot = await db.collection('friends').get();
    const friendIds = new Set();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.user1 === userId) {
        friendIds.add(data.user2);
      } else if (data.user2 === userId) {
        friendIds.add(data.user1);
      }
    });

    // If no friends found in new format, check for legacy data
    if (friendIds.size === 0) {
      const legacyKeys = [
        `friends_${userId}`,
        `userFriends_${userId}`,
        `${userId}_friends`
      ];

      for (const key of legacyKeys) {
        try {
          const legacyData = localStorage.getItem(key);
          if (legacyData) {
            const parsedData = JSON.parse(legacyData);
            console.log(`Migrating friends data from legacy key: ${key}`);

            // Migrate friends data - assuming it's an array of friend IDs
            if (Array.isArray(parsedData)) {
              for (const friendId of parsedData) {
                // Create friend relationship in new format
                await db.collection('friends').add({
                  user1: userId,
                  user2: friendId,
                  createdAt: new Date().toISOString()
                });
                friendIds.add(friendId);
              }
            }

            // Remove the legacy key
            localStorage.removeItem(key);
            break; // Exit after first successful migration
          }
        } catch (parseError) {
          console.warn(`Error parsing legacy friends data for key ${key}:`, parseError);
        }
      }
    }

    return { success: true, data: Array.from(friendIds) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Helper function to get all users for leaderboard
export const getAllUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    // If no users found in new format, check for legacy data
    if (users.length === 0) {
      console.log('No users found in new format, checking for legacy data...');

      // Check all localStorage keys for user data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user_') || key.startsWith('userProfile_') || key.startsWith('profile_'))) {
          try {
            const legacyData = localStorage.getItem(key);
            if (legacyData) {
              const parsedData = JSON.parse(legacyData);
              if (parsedData.uid) {
                console.log(`Found legacy user data for ${parsedData.uid}, migrating...`);

                // Migrate to new format
                await db.collection('users').doc(parsedData.uid).set({
                  ...parsedData,
                  updatedAt: new Date().toISOString()
                });

                users.push({ uid: parsedData.uid, ...parsedData });

                // Remove legacy key
                localStorage.removeItem(key);
              }
            }
          } catch (parseError) {
            console.warn(`Error parsing legacy user data for key ${key}:`, parseError);
          }
        }
      }
    }

    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Match System
export const createMatch = async (player1Id, player2Id, player1Name, player2Name) => {
  try {
    const matchData = {
      player1: player1Id,
      player2: player2Id,
      player1Name: player1Name,
      player2Name: player2Name,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('matches').add(matchData);
    return { success: true, matchId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserMatches = async (userId) => {
  try {
    const snapshot = await db.collection('matches').get();
    const matches = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.player1 === userId || data.player2 === userId) {
        matches.push({ id: doc.id, ...data });
      }
    });

    return { success: true, data: matches };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateMatchResult = async (matchId, result) => {
  try {
    await db.collection('matches').doc(matchId).update({
      ...result,
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listeners (simplified for web mock)
export const listenToFriendRequests = (userId, callback) => {
  // For web version, use polling instead of real-time listeners
  const interval = setInterval(async () => {
    try {
      const result = await getFriendRequests(userId);
      if (result.success) {
        callback(result.data);
      }
    } catch (error) {
      console.warn('Error polling friend requests:', error);
    }
  }, 2000);

  return () => clearInterval(interval);
};

export const listenToMatches = (userId, callback) => {
  // For web version, use polling instead of real-time listeners
  const interval = setInterval(async () => {
    try {
      const snapshot = await db.collection('matches').get();
      const matches = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.player2 === userId && data.status === 'pending') {
          matches.push({ id: doc.id, ...data });
        }
      });

      callback(matches);
    } catch (error) {
      console.warn('Error polling matches:', error);
    }
  }, 2000);

  return () => clearInterval(interval);
};