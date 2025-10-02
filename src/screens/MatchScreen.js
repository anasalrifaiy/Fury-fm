import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const MatchScreen = () => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [minute, setMinute] = useState(0);
  const [matchInProgress, setMatchInProgress] = useState(false);
  const [matchEvents, setMatchEvents] = useState([]);
  const [userData, setUserData] = useState({});
  const [opponentName, setOpponentName] = useState('');
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    loadUserData();
    loadRecentMatches();
    generateOpponent();
  }, []);

  const loadUserData = async () => {
    const currentUser = auth().currentUser;
    const doc = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();
    setUserData(doc.data());
  };

  const loadRecentMatches = async () => {
    const currentUser = auth().currentUser;
    const snapshot = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('matches')
      .orderBy('playedAt', 'desc')
      .limit(5)
      .get();
    
    const matches = [];
    snapshot.forEach(doc => {
      matches.push(doc.data());
    });
    setRecentMatches(matches);
  };

  const generateOpponent = () => {
    const clubNames = ['United', 'City', 'Athletic', 'Real', 'Dynamo', 'Sporting', 'Racing', 'Wanderers'];
    const opponent = clubNames[Math.floor(Math.random() * clubNames.length)] + ' FC';
    setOpponentName(opponent);
  };

  const playMatch = async () => {
    setMatchInProgress(true);
    setHomeScore(0);
    setAwayScore(0);
    setMinute(0);
    setMatchEvents([]);
    
    // Get squad for simulation
    const squadSnapshot = await firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .collection('squad')
      .get();
    
    const squad = [];
    squadSnapshot.forEach(doc => {
      squad.push(doc.data());
    });
    
    // Calculate team strength
    const teamRating = squad.reduce((sum, player) => sum + player.rating, 0) / squad.length;
    const opponentRating = 65 + Math.floor(Math.random() * 20);
    
    // Simulate match
    let currentMinute = 0;
    let homeGoals = 0;
    let awayGoals = 0;
    const events = [];
    
    const matchInterval = setInterval(() => {
      currentMinute += Math.floor(Math.random() * 5) + 1;
      if (currentMinute > 90) currentMinute = 90;
      
      setMinute(currentMinute);
      
      // Random events
      const eventChance = Math.random();
      
      if (eventChance > 0.85) {
        // Goal chance
        const scoringTeam = Math.random() < (teamRating / (teamRating + opponentRating)) ? 'home' : 'away';
        const scorer = squad[Math.floor(Math.random() * squad.length)];
        
        if (scoringTeam === 'home') {
          homeGoals++;
          setHomeScore(homeGoals);
          const event = {
            minute: currentMinute,
            type: 'goal',
            team: 'home',
            message: `⚽ GOAL! ${scorer.name} scores!`
          };
          events.unshift(event);
          setMatchEvents([...events]);
        } else {
          awayGoals++;
          setAwayScore(awayGoals);
          const event = {
            minute: currentMinute,
            type: 'goal',
            team: 'away',
            message: `⚽ GOAL! ${opponentName} scores!`
          };
          events.unshift(event);
          setMatchEvents([...events]);
        }
      } else if (eventChance > 0.75) {
        // Yellow card
        const team = Math.random() > 0.5 ? 'home' : 'away';
        const player = squad[Math.floor(Math.random() * squad.length)];
        
        const event = {
          minute: currentMinute,
          type: 'yellow',
          team: team,
          message: team === 'home' 
            ? `🟨 Yellow card: ${player.name}`
            : `🟨 Yellow card: ${opponentName} player`
        };
        events.unshift(event);
        setMatchEvents([...events]);
      }
      
      if (currentMinute >= 90) {
        clearInterval(matchInterval);
        finishMatch(homeGoals, awayGoals);
      }
    }, 2000);
  };

  const finishMatch = async (home, away) => {
    let result, coins, trophies = 0;
    
    if (home > away) {
      result = 'Victory';
      coins = 3000 + (home * 500);
      if (Math.random() > 0.7) trophies = 1;
    } else if (home < away) {
      result = 'Defeat';
      coins = 1000;
    } else {
      result = 'Draw';
      coins = 2000;
    }
    
    // Update user stats
    const currentUser = auth().currentUser;
    const updates = {
      matches: firestore.FieldValue.increment(1),
      coins: firestore.FieldValue.increment(coins)
    };
    
    if (home > away) {
      updates.wins = firestore.FieldValue.increment(1);
    } else if (home < away) {
      updates.losses = firestore.FieldValue.increment(1);
    } else {
      updates.draws = firestore.FieldValue.increment(1);
    }
    
    if (trophies > 0) {
      updates.trophies = firestore.FieldValue.increment(trophies);
    }
    
    await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update(updates);
    
    // Save match result
    await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('matches')
      .add({
        homeScore: home,
        awayScore: away,
        opponent: opponentName,
        result: result,
        coins: coins,
        trophies: trophies,
        playedAt: firestore.FieldValue.serverTimestamp()
      });
    
    Alert.alert(
      result + '!',
      `Final Score: ${home}-${away}\nEarnings: ${coins}${trophies > 0 ? '\n🏆 Trophy earned!' : ''}`
    );
    
    setMatchInProgress(false);
    loadRecentMatches();
    loadUserData();
    generateOpponent();
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Match Day</Text>
        
        <View style={styles.scoreBoard}>
          <View style={styles.team}>
            <Text style={styles.teamName}>{userData.clubName || 'Your Team'}</Text>
            <Text style={styles.score}>{homeScore}</Text>
          </View>
          
          <View style={styles.versus}>
            <Text style={styles.vsText}>VS</Text>
            {matchInProgress && (
              <Text style={styles.minute}>{minute}'</Text>
            )}
          </View>
          
          <View style={styles.team}>
            <Text style={styles.teamName}>{opponentName}</Text>
            <Text style={styles.score}>{awayScore}</Text>
          </View>
        </View>
        
        {matchInProgress ? (
          <View style={styles.matchStatus}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.statusText}>Match in Progress</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.playButton}
            onPress={playMatch}
          >
            <Text style={styles.playButtonText}>Play Match</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
      
      {matchEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Match Events</Text>
          {matchEvents.slice(0, 5).map((event, index) => (
            <View key={index} style={[
              styles.eventCard,
              event.type === 'goal' && styles.goalEvent,
              event.type === 'yellow' && styles.yellowEvent
            ]}>
              <Text style={styles.eventMinute}>{event.minute}'</Text>
              <Text style={styles.eventMessage}>{event.message}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Matches</Text>
        {recentMatches.map((match, index) => (
          <View key={index} style={styles.matchCard}>
            <Text style={styles.matchScore}>
              {userData.clubName} {match.homeScore} - {match.awayScore} {match.opponent}
            </Text>
            <Text style={[
              styles.matchResult,
              match.result === 'Victory' && styles.winResult,
              match.result === 'Defeat' && styles.loseResult,
              match.result === 'Draw' && styles.drawResult
            ]}>
              {match.result} • +${match.coins} {match.trophies > 0 && '• 🏆'}
            </Text>
          </View>
        ))}
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
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  team: {
    alignItems: 'center',
  },
  teamName: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  score: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  versus: {
    alignItems: 'center',
  },
  vsText: {
    color: 'white',
    fontSize: 20,
    opacity: 0.8,
  },
  minute: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
  },
  matchStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  playButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ddd',
  },
  goalEvent: {
    borderLeftColor: '#27ae60',
    backgroundColor: '#f0fff4',
  },
  yellowEvent: {
    borderLeftColor: '#f39c12',
    backgroundColor: '#fffef0',
  },
  eventMinute: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#666',
  },
  eventMessage: {
    flex: 1,
    color: '#333',
  },
  recentSection: {
    padding: 20,
  },
  matchCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  matchResult: {
    fontSize: 14,
  },
  winResult: {
    color: '#27ae60',
  },
  loseResult: {
    color: '#e74c3c',
  },
  drawResult: {
    color: '#f39c12',
  },
});

export default MatchScreen;