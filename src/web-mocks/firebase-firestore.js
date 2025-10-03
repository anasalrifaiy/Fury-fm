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



const firestore = () => ({
  collection: (collectionName) => ({
    add: async (data) => {
      console.log(`Mock Firestore: Adding document to ${collectionName}:`, data);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate a unique ID for the new document
      const docId = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const key = getStorageKey(collectionName, docId);
      setToStorage(key, { ...data, id: docId });

      return { id: docId };
    },

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