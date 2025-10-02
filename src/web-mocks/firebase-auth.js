// Web mock for Firebase Auth with localStorage persistence
const AUTH_STORAGE_KEY = 'firebase_auth_user';

let currentUser = null;
let authStateCallbacks = [];

// Initialize auth state from localStorage
const initAuthState = () => {
  try {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
  } catch (error) {
    console.warn('Error loading auth state:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

// Save auth state to localStorage
const saveAuthState = (user) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Error saving auth state:', error);
  }
};

// Create user ID from email
const createUserId = (email) => {
  return 'web_' + email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

// Initialize on load
initAuthState();

const auth = () => ({
  get currentUser() {
    return currentUser;
  },

  signInWithEmailAndPassword: async (email, password) => {
    console.log('Mock Auth: Signing in with email:', email);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    // Simple validation
    if (!email || !password) {
      throw new Error('Invalid email or password');
    }

    const user = {
      uid: createUserId(email),
      email: email,
      displayName: email.split('@')[0] // Use email prefix as display name
    };

    currentUser = user;
    saveAuthState(user);

    // Notify all listeners
    authStateCallbacks.forEach(callback => {
      try {
        callback(currentUser);
      } catch (error) {
        console.warn('Error in auth state callback:', error);
      }
    });

    return { user: currentUser };
  },

  createUserWithEmailAndPassword: async (email, password) => {
    console.log('Mock Auth: Creating user with email:', email);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    // Simple validation
    if (!email || !password) {
      throw new Error('Invalid email or password');
    }

    if (password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }

    const user = {
      uid: createUserId(email),
      email: email,
      displayName: email.split('@')[0]
    };

    currentUser = user;
    saveAuthState(user);

    // Notify all listeners
    authStateCallbacks.forEach(callback => {
      try {
        callback(currentUser);
      } catch (error) {
        console.warn('Error in auth state callback:', error);
      }
    });

    return { user: currentUser };
  },

  signOut: async () => {
    console.log('Mock Auth: Signing out');
    await new Promise(resolve => setTimeout(resolve, 500));

    currentUser = null;
    saveAuthState(null);

    // Notify all listeners
    authStateCallbacks.forEach(callback => {
      try {
        callback(null);
      } catch (error) {
        console.warn('Error in auth state callback:', error);
      }
    });
  },

  onAuthStateChanged: (callback) => {
    authStateCallbacks.push(callback);

    // Immediately call with current state
    setTimeout(() => {
      try {
        callback(currentUser);
      } catch (error) {
        console.warn('Error in initial auth state callback:', error);
      }
    }, 100);

    // Return unsubscribe function
    return () => {
      authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
    };
  },

  // Utility method to manually trigger auth state change (for testing)
  _triggerAuthStateChange: () => {
    authStateCallbacks.forEach(callback => {
      try {
        callback(currentUser);
      } catch (error) {
        console.warn('Error in manual auth state callback:', error);
      }
    });
  }
});

export default auth;