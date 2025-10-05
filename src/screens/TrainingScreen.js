import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import auth from '@react-native-firebase/auth';

const TrainingScreen = () => {
  const [playerStats, setPlayerStats] = useState({});
  const [trainingPoints, setTrainingPoints] = useState(50);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const trainingPrograms = [
    { id: 'fitness', name: 'Fitness Training', stat: 'fitness', cost: 5 },
    { id: 'shooting', name: 'Shooting Practice', stat: 'shooting', cost: 8 },
    { id: 'passing', name: 'Passing Drills', stat: 'passing', cost: 6 },
    { id: 'defending', name: 'Defensive Training', stat: 'defending', cost: 7 },
    { id: 'speed', name: 'Speed Training', stat: 'pace', cost: 10 },
  ];

  const handleTraining = (program) => {
    if (trainingPoints >= program.cost) {
      setTrainingPoints(prev => prev - program.cost);
      Alert.alert('Training Complete!', `${program.name} completed successfully!`);
    } else {
      Alert.alert('Insufficient Training Points', 'You need more training points for this program.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Center</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>Training Points: {trainingPoints}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Training Programs</Text>
        {trainingPrograms.map(program => (
          <TouchableOpacity
            key={program.id}
            style={styles.programCard}
            onPress={() => handleTraining(program)}
          >
            <View style={styles.programInfo}>
              <Text style={styles.programName}>{program.name}</Text>
              <Text style={styles.programDetails}>
                Improves: {program.stat} | Cost: {program.cost} points
              </Text>
            </View>
            <View style={styles.programCost}>
              <Text style={styles.costText}>{program.cost}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Schedule</Text>
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleText}>Weekly Training: Monday, Wednesday, Friday</Text>
          <Text style={styles.scheduleText}>Recovery: Tuesday, Thursday</Text>
          <Text style={styles.scheduleText}>Match Day: Saturday</Text>
          <Text style={styles.scheduleText}>Rest Day: Sunday</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Facilities</Text>
        <View style={styles.facilitiesGrid}>
          <View style={styles.facilityCard}>
            <Text style={styles.facilityName}>Gym</Text>
            <Text style={styles.facilityLevel}>Level 2</Text>
          </View>
          <View style={styles.facilityCard}>
            <Text style={styles.facilityName}>Practice Pitch</Text>
            <Text style={styles.facilityLevel}>Level 3</Text>
          </View>
          <View style={styles.facilityCard}>
            <Text style={styles.facilityName}>Medical Center</Text>
            <Text style={styles.facilityLevel}>Level 1</Text>
          </View>
          <View style={styles.facilityCard}>
            <Text style={styles.facilityName}>Youth Academy</Text>
            <Text style={styles.facilityLevel}>Level 2</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  pointsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  programCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  programDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  programCost: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  costText: {
    color: '#fff',
    fontWeight: '600',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scheduleText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  facilityLevel: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 5,
  },
});

export default TrainingScreen;