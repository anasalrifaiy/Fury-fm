// Web mock for Firebase Firestore with localStorage persistence
const STORAGE_PREFIX = 'firestore_';

const getStorageKey = (collectionName, docId) => `${STORAGE_PREFIX}${collectionName}_${docId}`;

const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Error parsing storage data:', error);
    return null;
  }
};

const setToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving to storage:', error);
  }
};

// Initialize default user data if not exists
const initDefaultUserData = (userId) => {
  const userKey = getStorageKey('users', userId);
  const existingData = getFromStorage(userKey);

  if (!existingData) {
    const defaultData = {
      uid: userId,
      name: 'Demo User',
      clubName: 'Demo FC',
      level: 1,
      coins: 50000,
      trophies: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      matches: 0,
      createdAt: new Date().toISOString()
    };
    setToStorage(userKey, defaultData);

    // Initialize default squad
    initDefaultSquad(userId);
  }
};

const initDefaultSquad = (userId) => {
  const defaultSquad = [
    { id: '1', name: 'Marcus Rashford', position: 'LW', rating: 85, pace: 90, shooting: 84, passing: 75, defending: 40, physical: 78, number: 10, goals: 5, assists: 3, matches: 8, value: 45000 },
    { id: '2', name: 'Bruno Fernandes', position: 'CAM', rating: 86, pace: 68, shooting: 85, passing: 90, defending: 55, physical: 75, number: 8, goals: 8, assists: 12, matches: 10, value: 50000 },
    { id: '3', name: 'Casemiro', position: 'CDM', rating: 85, pace: 55, shooting: 72, passing: 85, defending: 90, physical: 88, number: 18, goals: 2, assists: 4, matches: 9, value: 35000 },
    { id: '4', name: 'Virgil van Dijk', position: 'CB', rating: 88, pace: 75, shooting: 60, passing: 85, defending: 95, physical: 90, number: 4, goals: 1, assists: 1, matches: 8, value: 55000 },
    { id: '5', name: 'Alisson Becker', position: 'GK', rating: 89, pace: 45, shooting: 25, passing: 75, defending: 40, physical: 85, number: 1, goals: 0, assists: 0, matches: 10, value: 40000 }
  ];

  defaultSquad.forEach(player => {
    const playerKey = getStorageKey(`users/${userId}/squad`, player.id);
    setToStorage(playerKey, player);
  });
};

const firestore = () => ({
  collection: (collectionName) => ({
    doc: (docId) => ({
      set: async (data) => {
        console.log(`Mock Firestore: Setting document ${docId} in ${collectionName}:`, data);
        await new Promise(resolve => setTimeout(resolve, 500));

        const key = getStorageKey(collectionName, docId);
        setToStorage(key, { ...data, id: docId });

        return { id: docId };
      },

      update: async (data) => {
        console.log(`Mock Firestore: Updating document ${docId} in ${collectionName}:`, data);
        await new Promise(resolve => setTimeout(resolve, 500));

        const key = getStorageKey(collectionName, docId);
        const existing = getFromStorage(key) || {};
        const updated = { ...existing, ...data };
        setToStorage(key, updated);

        return { id: docId };
      },

      get: async () => {
        console.log(`Mock Firestore: Getting document ${docId} from ${collectionName}`);
        await new Promise(resolve => setTimeout(resolve, 300));

        const key = getStorageKey(collectionName, docId);
        const data = getFromStorage(key);

        // Initialize user data if accessing a user document and it doesn't exist
        if (collectionName === 'users' && !data) {
          initDefaultUserData(docId);
          const newData = getFromStorage(key);
          return {
            exists: !!newData,
            data: () => newData || {}
          };
        }

        return {
          exists: !!data,
          data: () => data || {}
        };
      },

      collection: (subCollectionName) => ({
        doc: (subDocId) => ({
          set: async (data) => {
            console.log(`Mock Firestore: Setting subdocument ${subDocId} in ${collectionName}/${docId}/${subCollectionName}:`, data);
            await new Promise(resolve => setTimeout(resolve, 500));

            const key = getStorageKey(`${collectionName}/${docId}/${subCollectionName}`, subDocId);
            setToStorage(key, { ...data, id: subDocId });

            return { id: subDocId };
          },

          update: async (data) => {
            console.log(`Mock Firestore: Updating subdocument ${subDocId} in ${collectionName}/${docId}/${subCollectionName}:`, data);
            await new Promise(resolve => setTimeout(resolve, 500));

            const key = getStorageKey(`${collectionName}/${docId}/${subCollectionName}`, subDocId);
            const existing = getFromStorage(key) || {};
            const updated = { ...existing, ...data };
            setToStorage(key, updated);

            return { id: subDocId };
          },

          get: async () => {
            console.log(`Mock Firestore: Getting subdocument ${subDocId} from ${collectionName}/${docId}/${subCollectionName}`);
            await new Promise(resolve => setTimeout(resolve, 300));

            const key = getStorageKey(`${collectionName}/${docId}/${subCollectionName}`, subDocId);
            const data = getFromStorage(key);

            return {
              exists: !!data,
              data: () => data || {}
            };
          },

          delete: async () => {
            console.log(`Mock Firestore: Deleting subdocument ${subDocId} from ${collectionName}/${docId}/${subCollectionName}`);
            await new Promise(resolve => setTimeout(resolve, 300));

            const key = getStorageKey(`${collectionName}/${docId}/${subCollectionName}`, subDocId);
            localStorage.removeItem(key);
          }
        }),

        get: async () => {
          console.log(`Mock Firestore: Getting collection ${collectionName}/${docId}/${subCollectionName}`);
          await new Promise(resolve => setTimeout(resolve, 300));

          const docs = [];
          const prefix = getStorageKey(`${collectionName}/${docId}/${subCollectionName}`, '');

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
              const data = getFromStorage(key);
              if (data) {
                docs.push({
                  id: data.id,
                  data: () => data,
                  exists: true
                });
              }
            }
          }

          return {
            docs,
            empty: docs.length === 0,
            size: docs.length
          };
        }
      })
    }),

    get: async () => {
      console.log(`Mock Firestore: Getting collection ${collectionName}`);
      await new Promise(resolve => setTimeout(resolve, 300));

      const docs = [];
      const prefix = getStorageKey(collectionName, '');

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const data = getFromStorage(key);
          if (data) {
            docs.push({
              id: data.id,
              data: () => data,
              exists: true
            });
          }
        }
      }

      return {
        docs,
        empty: docs.length === 0,
        size: docs.length
      };
    }
  }),

  FieldValue: {
    serverTimestamp: () => new Date().toISOString(),
    increment: (value) => ({ _increment: value }),
    arrayUnion: (...elements) => ({ _arrayUnion: elements }),
    arrayRemove: (...elements) => ({ _arrayRemove: elements })
  },

  batch: () => ({
    set: (docRef, data) => {
      // Store batch operations for commit
      console.log('Mock Firestore: Batch set operation queued');
    },
    update: (docRef, data) => {
      console.log('Mock Firestore: Batch update operation queued');
    },
    delete: (docRef) => {
      console.log('Mock Firestore: Batch delete operation queued');
    },
    commit: async () => {
      console.log('Mock Firestore: Batch commit executed');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  })
});

export default firestore;