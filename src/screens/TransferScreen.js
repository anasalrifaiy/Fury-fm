import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getTransferMarketPlayers, DEFAULT_BALANCE } from '../data/playersDatabase';

// Mock Slider component since @react-native-slider/slider might not be installed
const MockSlider = ({ style, minimumValue, maximumValue, value, onValueChange, ...props }) => {
  return (
    <View style={[{ height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, justifyContent: 'center', paddingHorizontal: 10 }, style]}>
      <View style={{ height: 4, backgroundColor: '#ddd', borderRadius: 2 }}>
        <View
          style={{
            height: 4,
            backgroundColor: '#667eea',
            borderRadius: 2,
            width: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`
          }}
        />
      </View>
      <TouchableOpacity
        style={{
          position: 'absolute',
          left: `${((value - minimumValue) / (maximumValue - minimumValue)) * 85}%`,
          width: 20,
          height: 20,
          backgroundColor: '#667eea',
          borderRadius: 10,
          top: 10
        }}
        onPress={() => {
          // Simple increment/decrement on press
          const increment = (maximumValue - minimumValue) * 0.05;
          const newValue = Math.min(maximumValue, value + increment);
          onValueChange(newValue);
        }}
      />
    </View>
  );
};

const TransferScreen = () => {
  const [transferMarket, setTransferMarket] = useState([]);
  const [filteredMarket, setFilteredMarket] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [offerAmount, setOfferAmount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    loadTransferMarket();
    loadUserCoins();
  }, []);

  useEffect(() => {
    filterMarket();
  }, [searchText, positionFilter, priceFilter, transferMarket]);

  const loadUserCoins = async () => {
    // Initialize global balance if not set
    if (!global.userBalance) {
      global.userBalance = DEFAULT_BALANCE; // 500k for realistic transfers
    }
    setUserCoins(global.userBalance);
  };

  const loadTransferMarket = async () => {
    setLoading(true);

    // Get real players from database
    const realPlayers = getTransferMarketPlayers(25).map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      rating: player.rating,
      pace: player.pace,
      shooting: player.shooting,
      passing: player.passing,
      price: player.value,
      club: player.club,
      nationality: player.nationality,
      age: player.age,
      available: true
    }));

    // Simulate network delay
    setTimeout(() => {
      setTransferMarket(realPlayers);
      setFilteredMarket(realPlayers);
      setLoading(false);
    }, 1000);
  };

  const filterMarket = useCallback(() => {
    let filtered = [...transferMarket];
    
    // Search filter
    if (searchText) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(player => player.position === positionFilter);
    }
    
    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(player => {
        switch(priceFilter) {
          case 'budget':
            return player.price < 30000;
          case 'mid':
            return player.price >= 30000 && player.price <= 70000;
          case 'high':
            return player.price > 70000 && player.price <= 120000;
          case 'premium':
            return player.price > 120000;
          default:
            return true;
        }
      });
    }
    
    setFilteredMarket(filtered);
  }, [searchText, positionFilter, priceFilter, transferMarket]);

  const openNegotiation = (player) => {
    setSelectedPlayer(player);
    setOfferAmount(player.price);
    setModalVisible(true);
  };

  const makeOffer = async () => {
    if (userCoins < offerAmount) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough coins for this offer.');
      return;
    }
    
    const offerPercentage = (offerAmount / selectedPlayer.price) * 100;
    let acceptanceChance = 0;
    
    if (offerPercentage >= 100) {
      acceptanceChance = 0.95;
    } else if (offerPercentage >= 90) {
      acceptanceChance = 0.70;
    } else if (offerPercentage >= 80) {
      acceptanceChance = 0.40;
    } else if (offerPercentage >= 70) {
      acceptanceChance = 0.20;
    } else {
      acceptanceChance = 0.05;
    }
    
    const accepted = Math.random() < acceptanceChance;
    
    if (accepted) {
      // Transfer accepted - Mock functionality

      // Update user coins locally and globally
      const newBalance = userCoins - offerAmount;
      setUserCoins(newBalance);
      global.userBalance = newBalance;

      // Add player to squad
      const purchasedPlayer = {
        ...selectedPlayer,
        id: `purchased_${selectedPlayer.id}_${Date.now()}`, // Unique ID
        value: offerAmount,
        number: Math.floor(Math.random() * 99) + 1, // Random jersey number
        goals: 0,
        assists: 0,
        matches: 0,
        purchasedAt: new Date().toISOString()
      };

      // Initialize global purchased players array if not exists
      if (!global.purchasedPlayers) {
        global.purchasedPlayers = [];
      }
      global.purchasedPlayers.push(purchasedPlayer);

      // Remove player from transfer market
      setTransferMarket(prevMarket =>
        prevMarket.map(player =>
          player.id === selectedPlayer.id
            ? { ...player, available: false }
            : player
        )
      );

      Alert.alert(
        'Transfer Complete! ✅',
        `${selectedPlayer.name} has joined your squad for $${offerAmount.toLocaleString()}\n\nCheck your Squad tab to see your new player!`
      );

      setModalVisible(false);
      loadTransferMarket();

    } else {
      // Transfer rejected
      if (offerPercentage >= 85) {
        const counterOffer = Math.floor(selectedPlayer.price * 0.95);
        Alert.alert(
          'Counter Offer',
          `Your offer was rejected.\n\nCounter-offer: $${counterOffer.toLocaleString()}\n\nDo you accept?`,
          [
            { text: 'Reject', style: 'cancel' },
            { 
              text: 'Accept', 
              onPress: () => {
                setOfferAmount(counterOffer);
                makeOffer();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Offer Rejected ❌',
          `Your offer of $${offerAmount.toLocaleString()} was too low.\nTry offering closer to the asking price.`
        );
      }
    }
  };

  const renderPlayer = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => openNegotiation(item)}
    >
      <View style={styles.playerAvatar}>
        <Text style={styles.ratingBadge}>{item.rating}</Text>
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
        <View style={styles.playerStats}>
          <Text style={styles.statBadge}>⚡ {item.pace}</Text>
          <Text style={styles.statBadge}>🎯 {item.shooting}</Text>
          <Text style={styles.statBadge}>📍 {item.passing}</Text>
        </View>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${item.price.toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.negotiateButton}
          onPress={() => openNegotiation(item)}
        >
          <Text style={styles.negotiateText}>Negotiate</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          value={searchText}
          onChangeText={setSearchText}
        />
        
        <View style={styles.filterRow}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={positionFilter}
              onValueChange={setPositionFilter}
              style={styles.picker}
            >
              <Picker.Item label="All Positions" value="all" />
              <Picker.Item label="Goalkeeper" value="GK" />
              <Picker.Item label="Defender" value="CB" />
              <Picker.Item label="Left Back" value="LB" />
              <Picker.Item label="Right Back" value="RB" />
              <Picker.Item label="Defensive Mid" value="CDM" />
              <Picker.Item label="Central Mid" value="CM" />
              <Picker.Item label="Attacking Mid" value="CAM" />
              <Picker.Item label="Left Wing" value="LW" />
              <Picker.Item label="Right Wing" value="RW" />
              <Picker.Item label="Striker" value="ST" />
            </Picker>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={priceFilter}
              onValueChange={setPriceFilter}
              style={styles.picker}
            >
              <Picker.Item label="All Prices" value="all" />
              <Picker.Item label="Under $30k" value="budget" />
              <Picker.Item label="$30k-$70k" value="mid" />
              <Picker.Item label="$70k-$120k" value="high" />
              <Picker.Item label="Over $120k" value="premium" />
            </Picker>
          </View>
        </View>
        
        <View style={styles.balanceBar}>
          <Text style={styles.balanceText}>Your Balance: ${userCoins.toLocaleString()}</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          data={filteredMarket}
          renderItem={renderPlayer}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
      
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
                <Text style={styles.modalTitle}>Transfer Negotiation</Text>
                
                <View style={styles.playerDetails}>
                  <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                  <Text style={styles.modalPlayerInfo}>
                    {selectedPlayer.position} • Rating: {selectedPlayer.rating}
                  </Text>
                  <Text style={styles.askingPrice}>
                    Asking Price: ${selectedPlayer.price.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.offerSection}>
                  <Text style={styles.offerLabel}>Your Offer:</Text>
                  <Text style={styles.offerAmount}>${offerAmount.toLocaleString()}</Text>
                  
                  <MockSlider
                    style={styles.slider}
                    minimumValue={Math.floor(selectedPlayer.price * 0.7)}
                    maximumValue={Math.floor(selectedPlayer.price * 1.1)}
                    value={offerAmount}
                    onValueChange={value => setOfferAmount(Math.floor(value))}
                  />
                  
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>
                      Min: ${Math.floor(selectedPlayer.price * 0.7).toLocaleString()}
                    </Text>
                    <Text style={styles.sliderLabel}>
                      Max: ${Math.floor(selectedPlayer.price * 1.1).toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>
                      💡 Tip: Offering below asking price might be rejected.{'\n'}
                      Offering above increases acceptance chance!
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.offerButton]}
                    onPress={makeOffer}
                  >
                    <Text style={styles.buttonText}>Make Offer</Text>
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
  filterSection: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  balanceBar: {
    backgroundColor: '#f0f4ff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  list: {
    padding: 15,
  },
  playerCard: {
    flexDirection: 'row',
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
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
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
  priceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  negotiateButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  negotiateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  playerDetails: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalPlayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalPlayerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  askingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  offerSection: {
    marginBottom: 20,
  },
  offerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  offerAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  tipBox: {
    backgroundColor: '#f0f4ff',
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  tipText: {
    fontSize: 12,
    color: '#667eea',
    textAlign: 'center',
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
  offerButton: {
    backgroundColor: '#667eea',
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TransferScreen;