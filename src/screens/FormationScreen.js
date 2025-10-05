import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const FormationScreen = () => {
  const [formation, setFormation] = useState('4-4-2');
  const [squad, setSquad] = useState([]);
  const [formationPlayers, setFormationPlayers] = useState({});
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formations = {
    '4-4-2': [
      { pos: 'GK', x: 50, y: 85 },
      { pos: 'LB', x: 20, y: 65 },
      { pos: 'CB', x: 35, y: 65 },
      { pos: 'CB', x: 65, y: 65 },
      { pos: 'RB', x: 80, y: 65 },
      { pos: 'LM', x: 20, y: 40 },
      { pos: 'CM', x: 35, y: 40 },
      { pos: 'CM', x: 65, y: 40 },
      { pos: 'RM', x: 80, y: 40 },
      { pos: 'ST', x: 35, y: 15 },
      { pos: 'ST', x: 65, y: 15 }
    ],
    '4-3-3': [
      { pos: 'GK', x: 50, y: 85 },
      { pos: 'LB', x: 20, y: 65 },
      { pos: 'CB', x: 35, y: 65 },
      { pos: 'CB', x: 65, y: 65 },
      { pos: 'RB', x: 80, y: 65 },
      { pos: 'CM', x: 30, y: 40 },
      { pos: 'CM', x: 50, y: 40 },
      { pos: 'CM', x: 70, y: 40 },
      { pos: 'LW', x: 20, y: 15 },
      { pos: 'ST', x: 50, y: 15 },
      { pos: 'RW', x: 80, y: 15 }
    ],
    '3-5-2': [
      { pos: 'GK', x: 50, y: 85 },
      { pos: 'CB', x: 30, y: 65 },
      { pos: 'CB', x: 50, y: 65 },
      { pos: 'CB', x: 70, y: 65 },
      { pos: 'LM', x: 15, y: 40 },
      { pos: 'CM', x: 35, y: 40 },
      { pos: 'CM', x: 50, y: 40 },
      { pos: 'CM', x: 65, y: 40 },
      { pos: 'RM', x: 85, y: 40 },
      { pos: 'ST', x: 35, y: 15 },
      { pos: 'ST', x: 65, y: 15 }
    ]
  };

  useEffect(() => {
    loadSquad();
  }, []);

  const loadSquad = async () => {
    const currentUser = auth().currentUser;
    const snapshot = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('squad')
      .get();
    
    const players = [];
    snapshot.forEach(doc => {
      players.push({ id: doc.id, ...doc.data() });
    });
    setSquad(players);
  };

  const selectPosition = (index) => {
    setSelectedPosition(index);
    setModalVisible(true);
  };

  const assignPlayer = (player) => {
    const newFormationPlayers = { ...formationPlayers };
    newFormationPlayers[selectedPosition] = player;
    setFormationPlayers(newFormationPlayers);
    setModalVisible(false);
    
    // Save to Firebase
    firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .update({
        formation: formation,
        formationPlayers: newFormationPlayers
      });
  };

  const isPositionCompatible = (playerPos, formPos) => {
    const compatibility = {
      'GK': ['GK'],
      'DEF': ['LB', 'CB', 'RB', 'LWB', 'RWB'],
      'MID': ['LM', 'CM', 'RM', 'CDM', 'CAM'],
      'FWD': ['ST', 'LW', 'RW', 'CF']
    };
    
    for (const [key, positions] of Object.entries(compatibility)) {
      if (key === playerPos && positions.includes(formPos)) {
        return true;
      }
    }
    
    return false;
  };

  const renderPosition = (position, index) => {
    const player = formationPlayers[index];
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.position,
          { left: `${position.x}%`, top: `${position.y}%` },
          player && styles.positionFilled
        ]}
        onPress={() => selectPosition(index)}
      >
        {player ? (
          <>
            <Text style={styles.playerNumber}>{player.number || ''}</Text>
            <Text style={styles.playerShortName}>
              {player.name.split(' ')[0].substring(0, 3).toUpperCase()}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.positionIcon}>+</Text>
            <Text style={styles.positionLabel}>{position.pos}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderPlayerOption = ({ item }) => {
    const currentFormation = formations[formation];
    const isCompatible = selectedPosition !== null && 
      isPositionCompatible(item.position, currentFormation[selectedPosition].pos);
    
    return (
      <TouchableOpacity
        style={[
          styles.playerOption,
          !isCompatible && styles.playerOptionIncompatible
        ]}
        onPress={() => assignPlayer(item)}
      >
        <Text style={styles.playerOptionName}>{item.name}</Text>
        <Text style={styles.playerOptionInfo}>
          {item.position} • Rating: {item.rating}
        </Text>
        {!isCompatible && (
          <Text style={styles.incompatibleWarning}>⚠️ Position mismatch</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Formation</Text>
        <Picker
          selectedValue={formation}
          onValueChange={(value) => {
            setFormation(value);
            setFormationPlayers({});
          }}
          style={styles.picker}
        >
          <Picker.Item label="4-4-2" value="4-4-2" />
          <Picker.Item label="4-3-3" value="4-3-3" />
          <Picker.Item label="3-5-2" value="3-5-2" />
        </Picker>
      </View>
      
      <View style={styles.pitch}>
        {formations[formation].map((position, index) => 
          renderPosition(position, index)
        )}
      </View>
      
      <ScrollView style={styles.benchSection}>
        <Text style={styles.benchTitle}>Bench</Text>
        {squad.filter(player => {
          const isInFormation = Object.values(formationPlayers).some(
            fp => fp && fp.id === player.id
          );
          return !isInFormation;
        }).map(player => (
          <View key={player.id} style={styles.benchPlayer}>
            <Text style={styles.benchPlayerName}>{player.name}</Text>
            <Text style={styles.benchPlayerInfo}>
              {player.position} • Rating: {player.rating}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Player</Text>
            <FlatList
              data={squad}
              renderItem={renderPlayerOption}
              keyExtractor={item => item.id}
              style={styles.playerList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  pitch: {
    height: 400,
    backgroundColor: '#2ecc71',
    margin: 15,
    borderRadius: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  position: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  positionFilled: {
    backgroundColor: '#667eea',
  },
  positionIcon: {
    fontSize: 24,
    color: '#667eea',
  },
  positionLabel: {
    fontSize: 10,
    color: '#667eea',
  },
  playerNumber: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  playerShortName: {
    fontSize: 10,
    color: 'white',
  },
  benchSection: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
  },
  benchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  benchPlayer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  benchPlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  benchPlayerInfo: {
    fontSize: 12,
    color: '#666',
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
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  playerList: {
    maxHeight: 300,
  },
  playerOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerOptionIncompatible: {
    opacity: 0.5,
  },
  playerOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerOptionInfo: {
    fontSize: 14,
    color: '#666',
  },
  incompatibleWarning: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FormationScreen;