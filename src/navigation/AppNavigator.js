import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import all screens
import ProfileScreen from '../screens/ProfileScreen';
import SquadScreen from '../screens/SquadScreen';
import FormationScreen from '../screens/FormationScreen';
import TransferScreen from '../screens/TransferScreen';
import MatchScreen from '../screens/MatchScreen';
import FriendsScreen from '../screens/FriendsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();

// Tab icon component moved outside to avoid re-creation on each render
const TabIcon = ({ route, focused, color, size }) => {
  let iconName;

  switch (route.name) {
    case 'Profile':
      iconName = 'account';
      break;
    case 'Squad':
      iconName = 'soccer';
      break;
    case 'Formation':
      iconName = 'clipboard-text';
      break;
    case 'Transfer':
      iconName = 'swap-horizontal';
      break;
    case 'Match':
      iconName = 'sword-cross';
      break;
    case 'Friends':
      iconName = 'account-group';
      break;
    case 'Leaders':
      iconName = 'trophy';
      break;
    case 'Alerts':
      iconName = 'bell';
      break;
  }

  return <Icon name={iconName} size={size} color={color} />;
};

const AppNavigator = () => {
  const renderTabIcon = useCallback(({ route, ...iconProps }) => (
    <TabIcon route={route} {...iconProps} />
  ), []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: (iconProps) => renderTabIcon({ route, ...iconProps }),
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
        },
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Squad" component={SquadScreen} />
      <Tab.Screen name="Formation" component={FormationScreen} />
      <Tab.Screen name="Transfer" component={TransferScreen} />
      <Tab.Screen name="Match" component={MatchScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Leaders" component={LeaderboardScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;