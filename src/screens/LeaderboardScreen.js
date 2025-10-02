import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const snapshot = await firestore()
      .collection('users')
      .orderBy('trophies', 'desc')
      .orderBy('wins', 'desc')
      .limit(50)
      .get();
    
    const leaders = [];
    let currentUserRank = null;
    let rank = 1;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const points = (data.wins * 3) + (data.draws || 0);
      
      leaders.push({
        id: doc.id,
        rank: rank,
        ...data,
        points: points
      });
      
      if (doc.id === auth().currentUser.uid) {
        currentUserRank = rank;
      }
      
      rank++;
    });
    
    setLeaderboard(leaders);
    setUserRank(currentUserRank);
    setRefreshing(false);
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return styles.goldRank;
    if (rank === 2) return styles.silverRank;
    if (rank === 3) return styles.bronzeRank;
    return styles.normalRank;
  };

  const renderLeader = ({ item }) => {
    const isCurrentUser = item.id === auth().currentUser.uid;
    
    return (
      <View style={[
        styles.leaderCard,
        isCurrentUser && styles.currentUserCard
      ]}>
        <View style={[styles.rankBadge, getRankStyle(item.rank)]}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
        
        <View style={styles.leaderInfo}>
          <Text style={[
            styles.leaderName,
            isCurrentUser && styles.currentUserName
          ]}>
            {item.name} {isCurrentUser && '(You)'}
          </Text>
          <Text style={styles.leaderClub}>{item.clubName}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              {item.matches || 0} matches
            </Text>
            <Text style={styles.statText}>
              {item.wins || 0}W {item.draws || 0}D {item.losses || 0}L
            </Text>
          </View>
        </View>
        
        <View style={styles.pointsSection}>
          <Text style={styles.points}>{item.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
          <Text style={styles.trophies}>{item.trophies || 0} 🏆</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Global Leaderboard</Text>
        {userRank && (
          <Text style={styles.userRankText}>Your Rank: #{userRank}</Text>
        )}
      </LinearGradient>
      
      <FlatList
        data={leaderboard}
        renderItem={renderLeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadLeaderboard} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  userRankText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  list: {
    padding: 15,
  },
  leaderCard: {
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
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  goldRank: {
    backgroundColor: '#ffd700',
  },
  silverRank: {
    backgroundColor: '#c0c0c0',
  },
  bronzeRank: {
    backgroundColor: '#cd7f32',
  },
  normalRank: {
    backgroundColor: '#667eea',
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentUserName: {
    color: '#667eea',
  },
  leaderClub: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  pointsSection: {
    alignItems: 'center',
  },
  points: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#999',
  },
  trophies: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default LeaderboardScreen;