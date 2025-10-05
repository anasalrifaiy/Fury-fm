import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getTransferMarketPlayers, DEFAULT_BALANCE } from './data/playersDatabase';

const WebApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userData, setUserData] = useState({
    name: 'Web Demo User',
    clubName: 'Demo FC',
    coins: DEFAULT_BALANCE,
    level: 1,
    matches: 5,
    wins: 3,
    draws: 1,
    losses: 1
  });

  const [squad, setSquad] = useState([
    {
      id: '1',
      name: 'Marcus Rashford',
      position: 'LW',
      rating: 85,
      pace: 90,
      shooting: 84,
      number: 10
    },
    {
      id: '2',
      name: 'Bruno Fernandes',
      position: 'CAM',
      rating: 86,
      pace: 68,
      shooting: 85,
      number: 8
    },
    {
      id: '3',
      name: 'Casemiro',
      position: 'CDM',
      rating: 85,
      pace: 55,
      shooting: 72,
      number: 18
    }
  ]);

  const [transferPlayers] = useState(() => {
    return getTransferMarketPlayers(10).map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      rating: player.rating,
      pace: player.pace,
      shooting: player.shooting,
      value: player.value,
      club: player.club,
      nationality: player.nationality
    }));
  });

  const renderHomeScreen = () => (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>⚽ Football Manager Pro</Text>
        <Text style={styles.headerSubtitle}>Web Demo Version</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.matches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${userData.coins.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('squad')}>
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuText}>My Squad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('transfer')}>
          <Text style={styles.menuIcon}>💰</Text>
          <Text style={styles.menuText}>Transfer Market</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('profile')}>
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSquadScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My Squad ({squad.length} players)</Text>
      </View>

      {squad.map((player) => (
        <View key={player.id} style={styles.playerCard}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerNumber}>{player.number}</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPosition}>{player.position}</Text>
            <View style={styles.playerStats}>
              <Text style={styles.statBadge}>⚡ {player.pace}</Text>
              <Text style={styles.statBadge}>🎯 {player.shooting}</Text>
            </View>
          </View>
          <View style={styles.playerRating}>
            <Text style={styles.ratingText}>{player.rating}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderTransferScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Transfer Market</Text>
      </View>

      <View style={styles.balanceInfo}>
        <Text style={styles.balanceText}>Balance: ${userData.coins.toLocaleString()}</Text>
      </View>

      {transferPlayers.map((player) => (
        <View key={player.id} style={styles.playerCard}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerNumber}>⭐</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPosition}>{player.position}</Text>
            <Text style={styles.playerValue}>${player.value.toLocaleString()}</Text>
            <View style={styles.playerStats}>
              <Text style={styles.statBadge}>⚡ {player.pace}</Text>
              <Text style={styles.statBadge}>🎯 {player.shooting}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => {
              if (userData.coins >= player.value) {
                setUserData(prev => ({ ...prev, coins: prev.coins - player.value }));
                setSquad(prev => [...prev, { ...player, number: Math.floor(Math.random() * 99) + 1 }]);
                alert(`${player.name} signed successfully!`);
              } else {
                alert('Insufficient funds!');
              }
            }}
          >
            <Text style={styles.buyButtonText}>Sign</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderProfileScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.clubName}>{userData.clubName}</Text>
        <Text style={styles.level}>Level {userData.level} Manager</Text>
      </LinearGradient>

      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.matches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round((userData.wins / userData.matches) * 100)}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceValue}>💰 ${userData.coins.toLocaleString()}</Text>
      </View>

      <Text style={styles.webNote}>
        This is a web demo version of Football Manager Pro.
        Download the full mobile app for the complete experience!
      </Text>
    </ScrollView>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'squad': return renderSquadScreen();
      case 'transfer': return renderTransferScreen();
      case 'profile': return renderProfileScreen();
      default: return renderHomeScreen();
    }
  };

  return (
    <View style={styles.app}>
      {renderCurrentScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
    gap: 15,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 18,
    color: '#667eea',
    marginRight: 15,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playerPosition: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  playerValue: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  playerStats: {
    flexDirection: 'row',
    marginTop: 5,
  },
  statBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 11,
    marginRight: 5,
  },
  playerRating: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ratingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceInfo: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  buyButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileHeader: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  clubName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  level: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  balanceSection: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  webNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
    fontStyle: 'italic',
  },
});

export default WebApp;