import React, { useState, useEffect } from 'react';
import './src/styles/web.css';

// Import all screens
import AuthScreen from './src/screens/AuthScreen';
import SquadScreen from './src/screens/SquadScreen';
import FormationScreen from './src/screens/FormationScreen';
import MatchScreen from './src/screens/MatchScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import TransferScreen from './src/screens/TransferScreen';
import TrainingScreen from './src/screens/TrainingScreen';
import FinancialScreen from './src/screens/FinancialScreen';

// Import Firebase functions
import { loginUser, registerUser, logoutUser, onAuthStateChange, resetPassword } from './src/firebase/auth';
import { createUserProfile, getUserProfile, updateUserProfile, saveUserSquad, getUserSquad, sendFriendRequest, getFriendRequests, acceptFriendRequest, getUserFriends, listenToFriendRequests, createMatch, getUserMatches, listenToMatches, updateMatchResult, getAllUsers } from './src/firebase/database.web';

const FootballManagerPro = () => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [squad, setSquad] = useState([]);
  const [formation, setFormation] = useState('4-3-3');
  const [formationPlayers, setFormationPlayers] = useState({});
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClubName, setEditClubName] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsData, setFriendsData] = useState({});
  const [matches, setMatches] = useState([]);
  const [incomingMatches, setIncomingMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchSimulation, setMatchSimulation] = useState(null);
  const [matchEvents, setMatchEvents] = useState([]);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isMatchPlaying, setIsMatchPlaying] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [matchReadyState, setMatchReadyState] = useState(null);
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [customAlert, setCustomAlert] = useState(null);
  const [previousFriendRequestCount, setPreviousFriendRequestCount] = useState(0);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success) {
          let userData = profileResult.data;

          if (!userData.budget) {
            userData.budget = 200000000;
            userData.budgetUpgraded = true;
            await updateUserProfile(firebaseUser.uid, { budget: 200000000, budgetUpgraded: true });
          } else if (!userData.budgetUpgraded && userData.budget) {
            const upgradedBudget = userData.budget + 50000000;
            userData.budget = upgradedBudget;
            userData.budgetUpgraded = true;
            await updateUserProfile(firebaseUser.uid, { budget: upgradedBudget, budgetUpgraded: true });
            console.log(`Budget upgraded for user ${firebaseUser.uid}: ${userData.budget - 50000000} -> ${userData.budget}`);
          }

          setUser({
            ...userData,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || userData.name
          });
        } else {
          const defaultProfile = {
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            clubName: 'FC United',
            level: 1,
            budget: 200000000,
            trophies: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            budgetUpgraded: true,
          };

          const createResult = await createUserProfile(firebaseUser.uid, defaultProfile);
          if (createResult.success) {
            setUser({
              ...defaultProfile,
              uid: firebaseUser.uid,
              email: firebaseUser.email
            });
          }
        }

        const squadResult = await getUserSquad(firebaseUser.uid);
        if (squadResult.success && squadResult.data) {
          setSquad(squadResult.data);
        }

        setCurrentScreen('squad');
      } else {
        setUser(null);
        setCurrentScreen('auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Friend requests listener
  useEffect(() => {
    if (user) {
      const unsubscribeRequests = listenToFriendRequests(user.uid, (requests) => {
        setFriendRequests(prevRequests => {
          if (requests.length > prevRequests.length) {
            const newCount = requests.length - prevRequests.length;
            showAlert(`You have ${newCount} new friend request${newCount > 1 ? 's' : ''}!`, 'info');
          }
          return requests;
        });
      });

      const unsubscribeMatches = listenToMatches(user.uid, (matches) => {
        setIncomingMatches(matches);
        if (matches.length > 0) {
          console.log('New incoming matches:', matches);
        }
      });

      return () => {
        unsubscribeRequests();
        unsubscribeMatches();
      };
    }
  }, [user]);

  const showAlert = (message, type = 'info') => {
    setCustomAlert({ message, type });
  };

  const hideAlert = () => {
    setCustomAlert(null);
  };

  const handleAuth = async (email, password, name = null, clubName = null) => {
    try {
      setLoading(true);
      let result;

      if (authMode === 'login') {
        result = await loginUser(email, password);
      } else {
        result = await registerUser(email, password, name);
        if (result.success && result.user) {
          const profileData = {
            name: name || result.user.displayName || email.split('@')[0],
            clubName: clubName || 'FC United',
            level: 1,
            budget: 200000000,
            trophies: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            budgetUpgraded: true,
          };
          await createUserProfile(result.user.uid, profileData);
        }
      }

      if (!result.success) {
        showAlert(result.error, 'error');
      }
    } catch (error) {
      showAlert('Authentication failed. Please try again.', 'error');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setCurrentScreen('auth');
      setSquad([]);
      setFriends([]);
      setFriendRequests([]);
      setMatches([]);
      setIncomingMatches([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      const result = await resetPassword(email);
      if (result.success) {
        showAlert('Password reset email sent! Check your inbox.', 'success');
      } else {
        showAlert(result.error, 'error');
      }
    } catch (error) {
      showAlert('Failed to send reset email. Please try again.', 'error');
    }
  };

  const updateProfile = async (updates) => {
    try {
      const result = await updateUserProfile(user.uid, updates);
      if (result.success) {
        setUser({ ...user, ...updates });
        showAlert('Profile updated successfully!', 'success');
        return true;
      } else {
        showAlert(result.error, 'error');
        return false;
      }
    } catch (error) {
      showAlert('Failed to update profile. Please try again.', 'error');
      return false;
    }
  };

  const saveSquad = async (newSquad) => {
    try {
      const result = await saveUserSquad(user.uid, newSquad);
      if (result.success) {
        setSquad(newSquad);
        return true;
      } else {
        showAlert(result.error, 'error');
        return false;
      }
    } catch (error) {
      showAlert('Failed to save squad. Please try again.', 'error');
      return false;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#667eea' }}>Loading Football Manager Pro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
        <AuthScreen
          onAuth={handleAuth}
          onForgotPassword={handleForgotPassword}
          authMode={authMode}
          setAuthMode={setAuthMode}
          loading={loading}
        />
        {customAlert && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: customAlert.type === 'error' ? '#f44336' : customAlert.type === 'success' ? '#4CAF50' : '#2196F3',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '5px',
            zIndex: 1000,
            cursor: 'pointer'
          }} onClick={hideAlert}>
            {customAlert.message}
          </div>
        )}
      </div>
    );
  }

  const renderScreen = () => {
    const screenProps = {
      user,
      squad,
      setSquad,
      saveSquad,
      updateProfile,
      showAlert,
      formation,
      setFormation,
      formationPlayers,
      setFormationPlayers,
      selectedPosition,
      setSelectedPosition,
      showPlayerModal,
      setShowPlayerModal,
      editingProfile,
      setEditingProfile,
      editName,
      setEditName,
      editClubName,
      setEditClubName,
      friends,
      setFriends,
      friendRequests,
      setFriendRequests,
      friendsData,
      setFriendsData,
      matches,
      setMatches,
      incomingMatches,
      setIncomingMatches,
      searchTerm,
      setSearchTerm,
      matchSimulation,
      setMatchSimulation,
      matchEvents,
      setMatchEvents,
      currentMinute,
      setCurrentMinute,
      isMatchPlaying,
      setIsMatchPlaying,
      selectedPlayer,
      setSelectedPlayer,
      showPlayerDetail,
      setShowPlayerDetail,
      positionFilter,
      setPositionFilter,
      showManagerModal,
      setShowManagerModal,
      selectedManager,
      setSelectedManager,
      matchHistory,
      setMatchHistory,
      matchReadyState,
      setMatchReadyState,
      currentMatchId,
      setCurrentMatchId,
      sendFriendRequest,
      getFriendRequests,
      acceptFriendRequest,
      getUserFriends,
      createMatch,
      getUserMatches,
      updateMatchResult,
      getAllUsers
    };

    switch (currentScreen) {
      case 'squad':
        return <SquadScreen {...screenProps} />;
      case 'formation':
        return <FormationScreen {...screenProps} />;
      case 'transfers':
        return <TransferScreen {...screenProps} />;
      case 'training':
        return <TrainingScreen {...screenProps} />;
      case 'financial':
        return <FinancialScreen {...screenProps} />;
      case 'matches':
        return <MatchScreen {...screenProps} />;
      case 'profile':
        return <ProfileScreen {...screenProps} onLogout={handleLogout} />;
      case 'friends':
        return <FriendsScreen {...screenProps} />;
      case 'leaderboard':
        return <LeaderboardScreen {...screenProps} />;
      case 'notifications':
        return <NotificationsScreen {...screenProps} />;
      default:
        return <SquadScreen {...screenProps} />;
    }
  };

  const navItems = [
    { key: 'squad', label: 'Squad', icon: '👥' },
    { key: 'formation', label: 'Formation', icon: '⚽' },
    { key: 'transfers', label: 'Transfers', icon: '🔄' },
    { key: 'training', label: 'Training', icon: '💪' },
    { key: 'financial', label: 'Finance', icon: '💰' },
    { key: 'matches', label: 'Matches', icon: '🏆' },
    { key: 'friends', label: 'Friends', icon: '👨‍👩‍👧‍👦' },
    { key: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '10px 0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        overflowX: 'auto',
        minHeight: '70px'
      }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setCurrentScreen(item.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 4px',
              backgroundColor: currentScreen === item.key ? '#667eea' : 'transparent',
              color: currentScreen === item.key ? '#fff' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: currentScreen === item.key ? '600' : '400',
              transition: 'all 0.2s ease',
              minWidth: '60px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (currentScreen !== item.key) {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (currentScreen !== item.key) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px', marginBottom: '2px' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.key === 'notifications' && friendRequests.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '15px',
                backgroundColor: '#f44336',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {friendRequests.length}
              </div>
            )}
            {item.key === 'matches' && incomingMatches.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '15px',
                backgroundColor: '#FF9800',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {incomingMatches.length}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Alert */}
      {customAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: customAlert.type === 'error' ? '#f44336' : customAlert.type === 'success' ? '#4CAF50' : '#2196F3',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '5px',
          zIndex: 1000,
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          maxWidth: '300px',
          wordWrap: 'break-word'
        }} onClick={hideAlert}>
          {customAlert.message}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive navigation for mobile */
        @media (max-width: 768px) {
          .nav-button {
            font-size: 8px !important;
            padding: 4px 2px !important;
            min-width: 50px !important;
          }
          .nav-button span:first-child {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FootballManagerPro;