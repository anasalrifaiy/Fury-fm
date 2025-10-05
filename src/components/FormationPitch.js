import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const FormationPitch = ({ formation, players, onPlayerPress, editable = false }) => {
  const getPositionStyle = (position) => {
    const positions = {
      // Goalkeeper
      GK: { top: '85%', left: '42.5%' },

      // Defenders
      'DEF-L': { top: '70%', left: '15%' },
      'DEF-CL': { top: '70%', left: '35%' },
      'DEF-CR': { top: '70%', left: '50%' },
      'DEF-R': { top: '70%', left: '70%' },

      // Midfielders
      'MID-L': { top: '50%', left: '15%' },
      'MID-CL': { top: '50%', left: '35%' },
      'MID-CR': { top: '50%', left: '50%' },
      'MID-R': { top: '50%', left: '70%' },

      // Attackers
      'ATT-L': { top: '25%', left: '25%' },
      'ATT-C': { top: '25%', left: '42.5%' },
      'ATT-R': { top: '25%', left: '60%' },
    };
    return positions[position] || { top: '50%', left: '50%' };
  };

  const getPlayerColor = (position) => {
    if (position.includes('GK')) return '#FF6B6B';
    if (position.includes('DEF')) return '#4ECDC4';
    if (position.includes('MID')) return '#45B7D1';
    if (position.includes('ATT')) return '#96CEB4';
    return '#95A5A6';
  };

  return (
    <View style={styles.pitchContainer}>
      {/* Pitch background */}
      <View style={styles.pitch}>
        {/* Center circle */}
        <View style={styles.centerCircle} />

        {/* Goal areas */}
        <View style={[styles.goalArea, styles.topGoalArea]} />
        <View style={[styles.goalArea, styles.bottomGoalArea]} />

        {/* Penalty areas */}
        <View style={[styles.penaltyArea, styles.topPenaltyArea]} />
        <View style={[styles.penaltyArea, styles.bottomPenaltyArea]} />

        {/* Players */}
        {players.map((player, index) => {
          const position = formation.positions[index];
          const positionStyle = getPositionStyle(position);

          return (
            <TouchableOpacity
              key={player.id || index}
              style={[
                styles.playerPosition,
                positionStyle,
                { backgroundColor: getPlayerColor(position) },
                editable && styles.editablePlayer,
              ]}
              onPress={() => onPlayerPress && onPlayerPress(player, index)}
              disabled={!editable}
            >
              <Text style={styles.playerNumber}>{index + 1}</Text>
              <Text style={styles.playerInitials} numberOfLines={1}>
                {player.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.formationName}>{formation.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pitchContainer: {
    alignItems: 'center',
    padding: 20,
  },
  pitch: {
    width: 300,
    height: 400,
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#fff',
  },
  centerCircle: {
    position: 'absolute',
    top: '42.5%',
    left: '37.5%',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  goalArea: {
    position: 'absolute',
    left: '35%',
    width: '30%',
    height: '12%',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  topGoalArea: {
    top: 0,
    borderBottomWidth: 2,
    borderTopWidth: 0,
  },
  bottomGoalArea: {
    bottom: 0,
    borderTopWidth: 2,
    borderBottomWidth: 0,
  },
  penaltyArea: {
    position: 'absolute',
    left: '25%',
    width: '50%',
    height: '22%',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  topPenaltyArea: {
    top: 0,
    borderBottomWidth: 2,
    borderTopWidth: 0,
  },
  bottomPenaltyArea: {
    bottom: 0,
    borderTopWidth: 2,
    borderBottomWidth: 0,
  },
  playerPosition: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  editablePlayer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playerNumber: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerInitials: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1,
  },
  formationName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default FormationPitch;