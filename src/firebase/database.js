// Firebase Firestore database services
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// User Profile Operations
export const createUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Squad Operations
export const saveUserSquad = async (userId, squadData) => {
  try {
    await setDoc(doc(db, 'squads', userId), {
      squad: squadData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserSquad = async (userId) => {
  try {
    const squadDoc = await getDoc(doc(db, 'squads', userId));
    if (squadDoc.exists()) {
      return { success: true, data: squadDoc.data().squad };
    } else {
      return { success: false, error: 'Squad not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Friends System
export const sendFriendRequest = async (fromUserId, toUserId, fromUserName) => {
  try {
    await addDoc(collection(db, 'friendRequests'), {
      from: fromUserId,
      to: toUserId,
      fromName: fromUserName,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFriendRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'friendRequests'),
      where('to', '==', userId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const acceptFriendRequest = async (requestId, userId, friendId) => {
  try {
    // Update request status
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });

    // Add to both users' friends lists
    await addDoc(collection(db, 'friends'), {
      user1: userId,
      user2: friendId,
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserFriends = async (userId) => {
  try {
    const q1 = query(collection(db, 'friends'), where('user1', '==', userId));
    const q2 = query(collection(db, 'friends'), where('user2', '==', userId));

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const friendIds = new Set();
    snapshot1.forEach(doc => friendIds.add(doc.data().user2));
    snapshot2.forEach(doc => friendIds.add(doc.data().user1));

    return { success: true, data: Array.from(friendIds) };
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
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'matches'), matchData);
    return { success: true, matchId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserMatches = async (userId) => {
  try {
    const q = query(
      collection(db, 'matches'),
      where('player1', '==', userId)
    );
    const q2 = query(
      collection(db, 'matches'),
      where('player2', '==', userId)
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q), getDocs(q2)]);

    const matches = [];
    snapshot1.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));
    snapshot2.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));

    return { success: true, data: matches };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateMatchResult = async (matchId, result) => {
  try {
    await updateDoc(doc(db, 'matches', matchId), {
      ...result,
      status: 'completed',
      completedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const listenToFriendRequests = (userId, callback) => {
  const q = query(
    collection(db, 'friendRequests'),
    where('to', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    callback(requests);
  });
};

export const listenToMatches = (userId, callback) => {
  const q = query(
    collection(db, 'matches'),
    where('player2', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const matches = [];
    snapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });
    callback(matches);
  });
};