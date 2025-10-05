import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getTransferMarketPlayers, DEFAULT_BALANCE } from './src/data/playersDatabase';

const SimpleWebApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Web User',
    clubName: 'Your FC',
    coins: DEFAULT_BALANCE,
    level: 1,
    matches: 5,
    wins: 3,
    draws: 1,
    losses: 1
  });
  const [editForm, setEditForm] = useState({
    name: 'Web User',
    clubName: 'Your FC'
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
    return getTransferMarketPlayers(200).map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      rating: player.rating,
      pace: player.pace,
      shooting: player.shooting,
      value: player.value,
      club: player.club,
      nationality: player.nationality,
      age: player.age
    }));
  });

  const buyPlayer = (player) => {
    if (userData.coins >= player.value) {
      setUserData(prev => ({ ...prev, coins: prev.coins - player.value }));
      setSquad(prev => [...prev, { ...player, number: Math.floor(Math.random() * 99) + 1 }]);
      Alert.alert('Success', `${player.name} signed successfully!`);
    } else {
      Alert.alert('Error', 'Insufficient funds!');
    }
  };

  const saveProfile = () => {
    setUserData(prev => ({
      ...prev,
      name: editForm.name,
      clubName: editForm.clubName
    }));
    setEditProfileModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const openEditProfile = () => {
    setEditForm({
      name: userData.name,
      clubName: userData.clubName
    });
    setEditProfileModal(true);
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, currentScreen === 'home' && styles.activeTab]}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.tabIcon}>🏠</Text>
        <Text style={styles.tabText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'squad' && styles.activeTab]}
        onPress={() => setCurrentScreen('squad')}
      >
        <Text style={styles.tabIcon}>👥</Text>
        <Text style={styles.tabText}>Squad</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'formation' && styles.activeTab]}
        onPress={() => setCurrentScreen('formation')}
      >
        <Text style={styles.tabIcon}>⚽</Text>
        <Text style={styles.tabText}>Formation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'transfer' && styles.activeTab]}
        onPress={() => setCurrentScreen('transfer')}
      >
        <Text style={styles.tabIcon}>💰</Text>
        <Text style={styles.tabText}>Transfer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'match' && styles.activeTab]}
        onPress={() => setCurrentScreen('match')}
      >
        <Text style={styles.tabIcon}>🏆</Text>
        <Text style={styles.tabText}>Match</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'friends' && styles.activeTab]}
        onPress={() => setCurrentScreen('friends')}
      >
        <Text style={styles.tabIcon}>👫</Text>
        <Text style={styles.tabText}>Friends</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'alerts' && styles.activeTab]}
        onPress={() => setCurrentScreen('alerts')}
      >
        <Text style={styles.tabIcon}>🔔</Text>
        <Text style={styles.tabText}>Alerts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'profile' && styles.activeTab]}
        onPress={() => setCurrentScreen('profile')}
      >
        <Text style={styles.tabIcon}>👤</Text>
        <Text style={styles.tabText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHomeScreen = () => (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>⚽ Football Manager Pro</Text>
        <Text style={styles.headerSubtitle}>Web Version - All 200+ Players Available</Text>
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
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{squad.length}</Text>
          <Text style={styles.statLabel}>Squad Size</Text>
        </View>
      </View>

      <View style={styles.welcomeText}>
        <Text style={styles.welcomeTitle}>Welcome to the Complete Football Manager Pro Web Experience!</Text>
        <Text style={styles.welcomeDescription}>
          • Browse and sign all 200+ real players from top 5 European leagues
        </Text>
        <Text style={styles.welcomeDescription}>
          • Manage your squad with realistic player ratings and stats
        </Text>
        <Text style={styles.welcomeDescription}>
          • Build your dream team with $500,000 starting balance
        </Text>
        <Text style={styles.welcomeDescription}>
          • Navigate through all app features: Home, Squad, Transfer Market, and Profile
        </Text>
      </View>
    </ScrollView>
  );

  const renderSquadScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>My Squad ({squad.length} players)</Text>
        <Text style={styles.balanceText}>Balance: ${userData.coins.toLocaleString()}</Text>
      </View>

      {squad.map((player) => (
        <View key={player.id} style={styles.playerCard}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerNumber}>{player.number}</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPosition}>{player.position}</Text>
            <Text style={styles.playerClub}>{player.club || 'Your Club'}</Text>
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
        <Text style={styles.screenTitle}>Transfer Market</Text>
        <Text style={styles.balanceText}>Balance: ${userData.coins.toLocaleString()}</Text>
      </View>

      <View style={styles.marketInfo}>
        <Text style={styles.marketTitle}>🌟 Top European Players Available</Text>
        <Text style={styles.marketSubtitle}>{transferPlayers.length} players from Premier League, La Liga, Serie A, Bundesliga & Ligue 1</Text>
      </View>

      {transferPlayers.map((player) => (
        <View key={player.id} style={styles.playerCard}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerNumber}>⭐</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPosition}>{player.position} • {player.club}</Text>
            <Text style={styles.playerNationality}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 {player.nationality} • Age {player.age}</Text>
            <Text style={styles.playerValue}>💰 ${player.value.toLocaleString()}</Text>
            <View style={styles.playerStats}>
              <Text style={styles.statBadge}>⚡ {player.pace}</Text>
              <Text style={styles.statBadge}>🎯 {player.shooting}</Text>
            </View>
          </View>
          <View style={styles.playerActions}>
            <View style={styles.playerRating}>
              <Text style={styles.ratingText}>{player.rating}</Text>
            </View>
            <TouchableOpacity
              style={[styles.buyButton, userData.coins < player.value && styles.buyButtonDisabled]}
              onPress={() => buyPlayer(player)}
              disabled={userData.coins < player.value}
            >
              <Text style={styles.buyButtonText}>
                {userData.coins >= player.value ? 'Sign' : 'No Funds'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderProfileScreen = () => (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.clubName}>{userData.clubName}</Text>
        <Text style={styles.level}>Level {userData.level} Manager</Text>
        <TouchableOpacity style={styles.editButton} onPress={openEditProfile}>
          <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
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
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{squad.length}</Text>
          <Text style={styles.statLabel}>Squad Size</Text>
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>💰 ${userData.coins.toLocaleString()}</Text>
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appInfoTitle}>🎮 Football Manager Pro Web</Text>
        <Text style={styles.appInfoText}>
          Complete web version with all features from the mobile app.
          Experience the full game with 200+ real players, squad management,
          and transfer market directly in your browser!
        </Text>
      </View>
    </ScrollView>
  );

  const renderFormationScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>⚽ Formation & Tactics</Text>
        <Text style={styles.balanceText}>Current: 4-3-3</Text>
      </View>

      <View style={styles.formationContainer}>
        <Text style={styles.formationTitle}>Choose Your Formation</Text>

        <View style={styles.formationOptions}>
          <TouchableOpacity style={styles.formationOption}>
            <Text style={styles.formationName}>4-3-3 (Attacking)</Text>
            <Text style={styles.formationDesc}>Balanced formation with attacking focus</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.formationOption}>
            <Text style={styles.formationName}>4-4-2 (Classic)</Text>
            <Text style={styles.formationDesc}>Traditional solid formation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.formationOption}>
            <Text style={styles.formationName}>3-5-2 (Defensive)</Text>
            <Text style={styles.formationDesc}>Strong midfield control</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.formationOption}>
            <Text style={styles.formationName}>4-2-3-1 (Modern)</Text>
            <Text style={styles.formationDesc}>Popular modern setup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tacticsSection}>
          <Text style={styles.tacticsTitle}>⚡ Team Instructions</Text>
          <View style={styles.tacticsOption}>
            <Text style={styles.tacticsLabel}>Playing Style:</Text>
            <Text style={styles.tacticsValue}>Attacking</Text>
          </View>
          <View style={styles.tacticsOption}>
            <Text style={styles.tacticsLabel}>Pressure:</Text>
            <Text style={styles.tacticsValue}>High</Text>
          </View>
          <View style={styles.tacticsOption}>
            <Text style={styles.tacticsLabel}>Width:</Text>
            <Text style={styles.tacticsValue}>Wide</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMatchScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>🏆 Matches</Text>
        <Text style={styles.balanceText}>Next: vs Arsenal</Text>
      </View>

      <View style={styles.matchSection}>
        <Text style={styles.sectionTitle}>⏰ Upcoming Fixtures</Text>

        <View style={styles.matchCard}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchTeams}>Your FC vs Arsenal</Text>
            <Text style={styles.matchTime}>Tomorrow, 3:00 PM</Text>
            <Text style={styles.matchVenue}>Emirates Stadium</Text>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Text style={styles.playButtonText}>▶️ Play Match</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.matchCard}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchTeams}>Your FC vs Manchester City</Text>
            <Text style={styles.matchTime}>Sunday, 4:30 PM</Text>
            <Text style={styles.matchVenue}>Etihad Stadium</Text>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Text style={styles.playButtonText}>📋 Preview</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.matchSection}>
        <Text style={styles.sectionTitle}>📊 Recent Results</Text>

        <View style={styles.resultCard}>
          <Text style={styles.resultTeams}>Your FC 2-1 Liverpool</Text>
          <Text style={styles.resultStatus}>✅ Win</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultTeams}>Chelsea 1-1 Your FC</Text>
          <Text style={styles.resultStatus}>⚖️ Draw</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultTeams}>Your FC 0-3 Barcelona</Text>
          <Text style={styles.resultStatus}>❌ Loss</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderFriendsScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>👫 Friends</Text>
        <Text style={styles.balanceText}>12 Friends</Text>
      </View>

      <View style={styles.friendsSection}>
        <TouchableOpacity style={styles.addFriendButton}>
          <Text style={styles.addFriendText}>➕ Add Friends</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>🎮 Online Friends</Text>

        <View style={styles.friendCard}>
          <View style={styles.friendAvatar}>
            <Text style={styles.friendInitials}>MJ</Text>
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>Mike Johnson</Text>
            <Text style={styles.friendStatus}>🟢 Online - Playing Match</Text>
            <Text style={styles.friendClub}>Club: Manchester Rovers</Text>
          </View>
          <TouchableOpacity style={styles.challengeButton}>
            <Text style={styles.challengeText}>⚔️ Challenge</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.friendCard}>
          <View style={styles.friendAvatar}>
            <Text style={styles.friendInitials}>AS</Text>
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>Alex Smith</Text>
            <Text style={styles.friendStatus}>🟢 Online - Transfer Market</Text>
            <Text style={styles.friendClub}>Club: London United</Text>
          </View>
          <TouchableOpacity style={styles.challengeButton}>
            <Text style={styles.challengeText}>💬 Message</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>⚪ Offline Friends</Text>

        <View style={styles.friendCard}>
          <View style={[styles.friendAvatar, styles.offlineAvatar]}>
            <Text style={styles.friendInitials}>RW</Text>
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>Robert Wilson</Text>
            <Text style={styles.friendStatus}>⚪ Last seen 2 hours ago</Text>
            <Text style={styles.friendClub}>Club: City Rangers</Text>
          </View>
          <TouchableOpacity style={[styles.challengeButton, styles.disabledButton]}>
            <Text style={styles.challengeText}>💤 Offline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderAlertsScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>🔔 Alerts & Notifications</Text>
        <Text style={styles.balanceText}>5 New</Text>
      </View>

      <View style={styles.alertsSection}>
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Text style={styles.alertEmoji}>⚽</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Match Result</Text>
            <Text style={styles.alertMessage}>Great win against Liverpool 2-1! You earned 50,000 coins.</Text>
            <Text style={styles.alertTime}>2 hours ago</Text>
          </View>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>New</Text>
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Text style={styles.alertEmoji}>💰</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Transfer Completed</Text>
            <Text style={styles.alertMessage}>Marcus Rashford has joined your squad for $75,000!</Text>
            <Text style={styles.alertTime}>5 hours ago</Text>
          </View>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>New</Text>
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Text style={styles.alertEmoji}>👫</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Friend Request</Text>
            <Text style={styles.alertMessage}>Alex Smith wants to be your friend!</Text>
            <Text style={styles.alertTime}>1 day ago</Text>
          </View>
          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>✅ Accept</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Text style={styles.alertEmoji}>🏆</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Achievement Unlocked</Text>
            <Text style={styles.alertMessage}>Congratulations! You've won 5 matches in a row.</Text>
            <Text style={styles.alertTime}>2 days ago</Text>
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Text style={styles.alertEmoji}>⚡</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Energy Restored</Text>
            <Text style={styles.alertMessage}>Your team energy is fully restored. Ready for the next match!</Text>
            <Text style={styles.alertTime}>3 days ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'squad': return renderSquadScreen();
      case 'formation': return renderFormationScreen();
      case 'transfer': return renderTransferScreen();
      case 'match': return renderMatchScreen();
      case 'friends': return renderFriendsScreen();
      case 'alerts': return renderAlertsScreen();
      case 'profile': return renderProfileScreen();
      default: return renderHomeScreen();
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={editProfileModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditProfileModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>✏️ Edit Profile</Text>

          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={editForm.name}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
            placeholder="Enter your name"
          />

          <Text style={styles.inputLabel}>Club Name</Text>
          <TextInput
            style={styles.input}
            value={editForm.clubName}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, clubName: text }))}
            placeholder="Enter club name"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setEditProfileModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.app}>
      {renderCurrentScreen()}
      {renderTabBar()}
      {renderEditModal()}
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
    paddingBottom: 80, // Add space for tab bar
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
    textAlign: 'center',
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
  welcomeText: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  tabText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  screenHeader: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  marketInfo: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  marketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  marketSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  playerClub: {
    fontSize: 12,
    color: '#999',
  },
  playerNationality: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  playerValue: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
    marginVertical: 2,
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
  playerActions: {
    alignItems: 'center',
  },
  playerRating: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  ratingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  appInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  appInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formationContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  formationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formationOption: {
    width: '30%',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  tacticsSection: {
    marginTop: 10,
  },
  tacticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tacticsOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  tacticsLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tacticsValue: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
  matchSection: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  matchCard: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchTeams: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  playButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  resultStatus: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  friendsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  challengeButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  addFriendButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  alertsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
});

export default SimpleWebApp;