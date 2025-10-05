import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SquadScreen = () => {
  const [squad, setSquad] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSquad();
  }, []);

  const loadSquad = async () => {
    // Mock squad data with some initial players
    const mockSquad = [
      {
        id: 'initial1',
        name: 'Marcus Rushford',
        position: 'FWD',
        rating: 82,
        pace: 90,
        shooting: 84,
        passing: 78,
        value: 35000,
        number: 10,
        goals: 8,
        assists: 4,
        matches: 15
      },
      {
        id: 'initial2',
        name: 'Bruno Fernandes',
        position: 'MID',
        rating: 86,
        pace: 68,
        shooting: 85,
        passing: 91,
        value: 55000,
        number: 8,
        goals: 12,
        assists: 9,
        matches: 18
      },
      {
        id: 'initial3',
        name: 'Harry Maguire',
        position: 'DEF',
        rating: 78,
        pace: 52,
        shooting: 45,
        passing: 71,
        value: 25000,
        number: 5,
        goals: 2,
        assists: 1,
        matches: 20
      }
    ];

    // Get purchased players from AsyncStorage or context (for now, just mock)
    const purchasedPlayers = global.purchasedPlayers || [];

    setSquad([...mockSquad, ...purchasedPlayers]);
    setRefreshing(false);
  };

  const sellPlayer = async () => {
    const sellPrice = Math.floor(selectedPlayer.value * 0.8);

    // Remove from squad
    setSquad(prevSquad => prevSquad.filter(player => player.id !== selectedPlayer.id));

    // Update global purchased players
    if (global.purchasedPlayers) {
      global.purchasedPlayers = global.purchasedPlayers.filter(player => player.id !== selectedPlayer.id);
    }

    // Update global balance
    if (global.userBalance) {
      global.userBalance += sellPrice;
    }

    setModalVisible(false);
    setSelectedPlayer(null);

    Alert.alert(
      'Player Sold! ✅',
      `${selectedPlayer.name} sold for $${sellPrice.toLocaleString()}`
    );
  };

  const renderPlayer = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => {
        setSelectedPlayer(item);
        setModalVisible(true);
      }}
    >
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.playerAvatar}
      >
        <Text style={styles.playerNumber}>{item.number || '?'}</Text>
      </LinearGradient>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
        <View style={styles.playerStats}>
          <Text style={styles.statBadge}>⚡ {item.pace || 70}</Text>
          <Text style={styles.statBadge}>🎯 {item.shooting || 65}</Text>
          <Text style={styles.statBadge}>📍 {item.passing || 68}</Text>
        </View>
      </View>
      
      <View style={styles.playerRating}>
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.squadSize}>Squad Size: {squad.length} players</Text>
      </View>
      
      <FlatList
        data={squad}
        renderItem={renderPlayer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadSquad} />
        }
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPlayer && (
              <>
                <LinearGradient 
                  colors={['#667eea', '#764ba2']} 
                  style={styles.modalAvatar}
                >
                  <Text style={styles.modalNumber}>{selectedPlayer.number}</Text>
                </LinearGradient>
                
                <Text style={styles.modalName}>{selectedPlayer.name}</Text>
                <Text style={styles.modalPosition}>{selectedPlayer.position}</Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.statLabel}>Overall Rating</Text>
                    <Text style={styles.statValue}>{selectedPlayer.rating}</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.statLabel}>Market Value</Text>
                    <Text style={styles.statValue}>${selectedPlayer.value.toLocaleString()}</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.statLabel}>⚡ Pace</Text>
                    <Text style={styles.statValue}>{selectedPlayer.pace || 70}</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.statLabel}>🎯 Shooting</Text>
                    <Text style={styles.statValue}>{selectedPlayer.shooting || 65}</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.statLabel}>📍 Passing</Text>
                    <Text style={styles.statValue}>{selectedPlayer.passing || 68}</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.statLabel}>🛡️ Defending</Text>
                    <Text style={styles.statValue}>{selectedPlayer.defending || 62}</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.statLabel}>💪 Physical</Text>
                    <Text style={styles.statValue}>{selectedPlayer.physical || 70}</Text>
                  </View>
                </View>
                
                <View style={styles.modalPerformance}>
                  <Text style={styles.perfItem}>
                    ⚽ {selectedPlayer.goals || 0} Goals
                  </Text>
                  <Text style={styles.perfItem}>
                    🅰️ {selectedPlayer.assists || 0} Assists
                  </Text>
                  <Text style={styles.perfItem}>
                    📊 {selectedPlayer.matches || 0} Matches
                  </Text>
                </View>
                
                <Text style={styles.sellInfo}>
                  Sell for: ${Math.floor(selectedPlayer.value * 0.8).toLocaleString()} (80% of value)
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.sellButton]}
                    onPress={sellPlayer}
                  >
                    <Text style={styles.buttonText}>Sell Player</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  squadSize: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 15,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumber: {
    color: 'white',
    fontSize: 24,
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalPosition: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalStats: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  modalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  modalPerformance: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  perfItem: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sellInfo: {
    textAlign: 'center',
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 5,
  },
  sellButton: {
    backgroundColor: '#e74c3c',
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SquadScreen;