import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MatchEvent = ({ event }) => {
  const getEventIcon = (type) => {
    const icons = {
      goal: 'soccer',
      yellowCard: 'card',
      redCard: 'card',
      substitution: 'swap-horizontal',
      injury: 'medical-bag',
      offside: 'flag',
      foul: 'whistle',
    };
    return icons[type] || 'information';
  };

  const getEventColor = (type) => {
    const colors = {
      goal: '#2ECC71',
      yellowCard: '#F1C40F',
      redCard: '#E74C3C',
      substitution: '#3498DB',
      injury: '#E67E22',
      offside: '#95A5A6',
      foul: '#34495E',
    };
    return colors[type] || '#95A5A6';
  };

  const formatTime = (minute) => {
    return `${minute}'`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(event.minute)}</Text>
      </View>

      <View style={[styles.iconContainer, { backgroundColor: getEventColor(event.type) }]}>
        <Icon
          name={getEventIcon(event.type)}
          size={20}
          color="#fff"
        />
      </View>

      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        {event.player && (
          <Text style={styles.playerName}>{event.player}</Text>
        )}
        {event.description && (
          <Text style={styles.eventDescription}>{event.description}</Text>
        )}
      </View>

      {event.team && (
        <View style={styles.teamIndicator}>
          <Text style={styles.teamText}>{event.team}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    width: 40,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 14,
    color: '#3498DB',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  teamIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ECF0F1',
    borderRadius: 12,
  },
  teamText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default MatchEvent;