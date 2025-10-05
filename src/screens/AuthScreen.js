import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { generateInitialSquad } from '../services/firebase';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [managerName, setManagerName] = useState('');
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await auth().signInWithEmailAndPassword(email, password);
      } else {
        if (!managerName || !clubName) {
          Alert.alert('Error', 'Please fill in all fields');
          setLoading(false);
          return;
        }

        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        
        await firestore().collection('users').doc(userCredential.user.uid).set({
          uid: userCredential.user.uid,
          email: email,
          name: managerName,
          clubName: clubName,
          level: 1,
          coins: 25000,
          trophies: 0,
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          formation: '4-4-2',
          profileImage: '',
          createdAt: firestore.FieldValue.serverTimestamp()
        });

        await generateInitialSquad(userCredential.user.uid);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Icon name="soccer" size={80} color="#fff" style={styles.logoIcon} />
            </View>
            <View style={styles.logoShadow} />
          </View>
          <Text style={styles.title}>
            {isLogin ? 'Welcome Back!' : 'Create Your Team'}
          </Text>

          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Manager Name"
                value={managerName}
                onChangeText={setManagerName}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="Club Name"
                value={clubName}
                onChangeText={setClubName}
                placeholderTextColor="#999"
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity 
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 3,
    borderColor: '#fff',
    position: 'relative',
    zIndex: 2,
  },
  logoIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4a5bb8',
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#667eea',
    marginBottom: 30,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    color: '#667eea',
    fontSize: 14,
  },
});

export default AuthScreen;