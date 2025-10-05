import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TransferCard = ({ player, onPress, showPrice = true, actionButton }) => {
  const getPositionColor = (position) => {
    const colors = {
      GK: '#FF6B6B',
      DEF: '#4ECDC4',
      MID: '#45B7D1',
      ATT: '#96CEB4',
    };
    return colors[position] || '#95A5A6';
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  const getValueIndicator = () => {
    if (player.marketValue && player.price) {
      const ratio = player.price / player.marketValue;
      if (ratio < 0.8) return { icon: 'trending-down', color: '#2ECC71', text: 'Good Deal' };
      if (ratio > 1.2) return { icon: 'trending-up', color: '#E74C3C', text: 'Overpriced' };
      return { icon: 'trending-neutral', color: '#F39C12', text: 'Fair Price' };
    }
    return null;
  };

  const valueIndicator = getValueIndicator();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.playerInfo}>
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

          <View style={styles.details}>
            <Text style={styles.playerName}>{player.name}</Text>
            <View style={styles.statsRow}>
              <View style={[styles.positionBadge, { backgroundColor: getPositionColor(player.position) }]}>
                <Text style={styles.positionText}>{player.position}</Text>
              </View>
              <Text style={styles.playerStats}>Age: {player.age}</Text>
            </View>
            <Text style={styles.playerStats}>Rating: {player.overallRating}</Text>
          </View>
        </View>

        {showPrice && player.price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatPrice(player.price)}</Text>
            {valueIndicator && (
              <View style={[styles.valueIndicator, { backgroundColor: valueIndicator.color }]}>
                <Icon name={valueIndicator.icon} size={12} color="#fff" />
                <Text style={styles.valueText}>{valueIndicator.text}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {player.club && (
        <View style={styles.clubContainer}>
          <Icon name="shield-outline" size={16} color="#7F8C8D" />
          <Text style={styles.clubText}>{player.club}</Text>
        </View>
      )}

      <View style={styles.attributesContainer}>
        {player.attributes && Object.entries(player.attributes).slice(0, 4).map(([key, value]) => (
          <View key={key} style={styles.attributeItem}>
            <Text style={styles.attributeLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <Text style={styles.attributeValue}>{value}</Text>
          </View>
        ))}
      </View>

      {actionButton && (
        <View style={styles.actionContainer}>
          {actionButton}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  imageContainer: {
    marginRight: 12,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  details: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  positionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerStats: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 4,
  },
  valueIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  valueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  clubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  attributesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  attributeLabel: {
    fontSize: 12,
    color: '#95A5A6',
    marginRight: 4,
  },
  attributeValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  actionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
});

export default TransferCard;