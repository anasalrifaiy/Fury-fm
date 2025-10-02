/* eslint-disable no-shadow */
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const onAuthStateChanged = useCallback((user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  }, [initializing]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [onAuthStateChanged]);

  if (initializing) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <AppNavigator /> : <AuthScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
