import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PlayerCard = ({ player, onPress, showPosition = true }) => {
  const getPositionColor = (position) => {
    const colors = {
      GK: '#FF6B6B',
      DEF: '#4ECDC4',
      MID: '#45B7D1',
      ATT: '#96CEB4',
    };
    return colors[position] || '#95A5A6';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {player.profileImage ? (
          <Image source={{ uri: player.profileImage }} style={styles.playerImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: getPositionColor(player.position) }]}>
            <Text style={styles.placeholderText}>
              {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.playerInfo}>
        <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
        {showPosition && (
          <View style={[styles.positionBadge, { backgroundColor: getPositionColor(player.position) }]}>
            <Text style={styles.positionText}>{player.position}</Text>
          </View>
        )}
        <Text style={styles.playerStats}>
          Rating: {player.overallRating} | Age: {player.age}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  positionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  positionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerStats: {
    fontSize: 12,
    color: '#7F8C8D',
  },
});

export default PlayerCard;