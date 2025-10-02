import React, { useState, useEffect } from 'react';
import './src/styles/web.css';
import { loginUser, registerUser, logoutUser, onAuthStateChange, resetPassword } from './src/firebase/auth';
import { createUserProfile, getUserProfile, updateUserProfile, saveUserSquad, getUserSquad, sendFriendRequest, getFriendRequests, acceptFriendRequest, getUserFriends, listenToFriendRequests, createMatch, getUserMatches, listenToMatches, updateMatchResult } from './src/firebase/database';
import firestore from './src/web-mocks/firebase-firestore';

const FootballManagerPro = () => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');

  const [squad, setSquad] = useState([]);

  const [formation, setFormation] = useState('4-3-3');
  const [formationPlayers, setFormationPlayers] = useState({});
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClubName, setEditClubName] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsData, setFriendsData] = useState({});
  const [matches, setMatches] = useState([]);
  const [incomingMatches, setIncomingMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchSimulation, setMatchSimulation] = useState(null);
  const [matchEvents, setMatchEvents] = useState([]);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isMatchPlaying, setIsMatchPlaying] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, load their profile
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success) {
          let userData = profileResult.data;

          // Migration: Set budget for users
          if (!userData.budget) {
            // New users get 200M
            userData.budget = 200000000;
            userData.budgetUpgraded = true;
            await updateUserProfile(firebaseUser.uid, { budget: 200000000, budgetUpgraded: true });
          } else if (!userData.budgetUpgraded && userData.budget) {
            // Existing users get +50M upgrade
            const upgradedBudget = userData.budget + 50000000;
            userData.budget = upgradedBudget;
            userData.budgetUpgraded = true;
            await updateUserProfile(firebaseUser.uid, { budget: upgradedBudget, budgetUpgraded: true });
            console.log(`Budget upgraded for user ${firebaseUser.uid}: ${userData.budget - 50000000} -> ${userData.budget}`);
          }

          setUser({
            ...userData,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || userData.name
          });
        } else {
          // Create default profile if none exists
          const defaultProfile = {
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            clubName: 'FC United',
            level: 1,
            budget: 200000000,
            trophies: 0,
            budgetUpgraded: true
          };
          await createUserProfile(firebaseUser.uid, defaultProfile);
          setUser({
            ...defaultProfile,
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
        }

        // Load squad data
        const squadResult = await getUserSquad(firebaseUser.uid);
        if (squadResult.success) {
          setSquad(squadResult.data);
        }

        // Load saved formation
        try {
          const formationDoc = await firestore().collection('users').doc(firebaseUser.uid).collection('formations').doc('current').get();
          if (formationDoc.exists) {
            const formationData = formationDoc.data();
            setFormation(formationData.formation);
            setFormationPlayers(formationData.formationPlayers);
          }
        } catch (error) {
          console.error('Error loading saved formation:', error);
        }

        // Load friends data and their names
        const friendsResult = await getUserFriends(firebaseUser.uid);
        if (friendsResult.success) {
          setFriends(friendsResult.data);

          // Load friend names
          const friendsNameData = {};
          for (const friendId of friendsResult.data) {
            const friendProfile = await getUserProfile(friendId);
            if (friendProfile.success) {
              friendsNameData[friendId] = friendProfile.data.name;
            } else {
              friendsNameData[friendId] = friendId.substring(0, 8) + '...';
            }
          }
          setFriendsData(friendsNameData);
        }

        // Load friend requests
        const requestsResult = await getFriendRequests(firebaseUser.uid);
        if (requestsResult.success) {
          setFriendRequests(requestsResult.data);
        }

        // Set up real-time friend request listener
        const unsubscribeRequests = listenToFriendRequests(firebaseUser.uid, (requests) => {
          setFriendRequests(requests);
        });

        // Set up real-time match challenge listener
        const unsubscribeMatches = listenToMatches(firebaseUser.uid, (matches) => {
          setIncomingMatches(matches);
        });

        setCurrentScreen('dashboard');
      } else {
        // User is logged out
        setUser(null);
        setCurrentScreen('auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  // Helper function to calculate realistic player values based on rating
  const calculatePlayerValue = (rating, age = 25) => {
    let baseValue;
    if (rating >= 90) baseValue = 80000000; // 80M for 90+ rated players
    else if (rating >= 88) baseValue = 60000000; // 60M for 88-89 rated players
    else if (rating >= 85) baseValue = 40000000; // 40M for 85-87 rated players
    else if (rating >= 82) baseValue = 25000000; // 25M for 82-84 rated players
    else if (rating >= 80) baseValue = 15000000; // 15M for 80-81 rated players
    else baseValue = 8000000; // 8M for under 80 rated players

    // Age factor (younger = more expensive)
    const ageFactor = age <= 22 ? 1.3 : age <= 25 ? 1.0 : age <= 28 ? 0.8 : 0.6;

    return Math.floor(baseValue * ageFactor);
  };

  const [transferPlayers] = useState((() => {
    const players = [
      // World Class Players (90+ rating)
      { id: 101, name: 'Kylian Mbappé', position: 'ST', rating: 91, age: 24, number: 7, club: 'PSG' },
      { id: 102, name: 'Erling Haaland', position: 'ST', rating: 90, age: 23, number: 9, club: 'Man City' },
      { id: 103, name: 'Kevin De Bruyne', position: 'CAM', rating: 91, age: 32, number: 17, club: 'Man City' },
      { id: 104, name: 'Lionel Messi', position: 'RW', rating: 90, age: 36, number: 10, club: 'Inter Miami' },
      { id: 105, name: 'Cristiano Ronaldo', position: 'ST', rating: 90, age: 39, number: 7, club: 'Al Nassr' },

      // Elite Players (85-89 rating)
      { id: 106, name: 'Mohamed Salah', position: 'RW', rating: 89, age: 31, number: 11, club: 'Liverpool' },
      { id: 107, name: 'Karim Benzema', position: 'ST', rating: 89, age: 35, number: 9, club: 'Al Ittihad' },
      { id: 108, name: 'Robert Lewandowski', position: 'ST', rating: 89, age: 35, number: 9, club: 'Barcelona' },
      { id: 109, name: 'Neymar Jr.', position: 'LW', rating: 89, age: 31, number: 10, club: 'Al Hilal' },
      { id: 110, name: 'Thibaut Courtois', position: 'GK', rating: 89, age: 31, number: 1, club: 'Real Madrid' },
      { id: 111, name: 'Virgil van Dijk', position: 'CB', rating: 88, age: 32, number: 4, club: 'Liverpool' },
      { id: 112, name: 'Luka Modrić', position: 'CM', rating: 87, age: 38, number: 10, club: 'Real Madrid' },
      { id: 113, name: 'N\'Golo Kanté', position: 'CDM', rating: 87, age: 32, number: 7, club: 'Al Ittihad' },
      { id: 114, name: 'Vinícius Jr.', position: 'LW', rating: 86, age: 23, number: 20, club: 'Real Madrid' },
      { id: 115, name: 'Sadio Mané', position: 'LW', rating: 86, age: 31, number: 10, club: 'Al Nassr' },
      { id: 116, name: 'Victor Osimhen', position: 'ST', rating: 86, age: 25, number: 9, club: 'Napoli' },
      { id: 117, name: 'Pedri', position: 'CAM', rating: 85, age: 21, number: 16, club: 'Barcelona' },
      { id: 118, name: 'Antoine Griezmann', position: 'CAM', rating: 85, age: 32, number: 8, club: 'Atletico' },
      { id: 119, name: 'Casemiro', position: 'CDM', rating: 85, age: 31, number: 18, club: 'Man United' },
      { id: 120, name: 'Alisson', position: 'GK', rating: 85, age: 30, number: 1, club: 'Liverpool' },

      // Very Good Players (80-84 rating)
      { id: 121, name: 'João Félix', position: 'CAM', rating: 84, age: 24, number: 7, club: 'Chelsea' },
      { id: 122, name: 'Phil Foden', position: 'CAM', rating: 84, age: 23, number: 47, club: 'Man City' },
      { id: 123, name: 'Bukayo Saka', position: 'RW', rating: 84, age: 22, number: 7, club: 'Arsenal' },
      { id: 124, name: 'Jude Bellingham', position: 'CM', rating: 84, age: 20, number: 5, club: 'Real Madrid' },
      { id: 125, name: 'Rafael Leão', position: 'LW', rating: 84, age: 24, number: 17, club: 'AC Milan' },
      { id: 126, name: 'Jamal Musiala', position: 'CAM', rating: 83, age: 21, number: 42, club: 'Bayern' },
      { id: 127, name: 'Mason Mount', position: 'CAM', rating: 83, age: 25, number: 19, club: 'Man United' },
      { id: 128, name: 'Khvicha Kvaratskhelia', position: 'LW', rating: 83, age: 23, number: 77, club: 'Napoli' },
      { id: 129, name: 'Declan Rice', position: 'CDM', rating: 83, age: 24, number: 41, club: 'Arsenal' },
      { id: 130, name: 'Gianluigi Donnarumma', position: 'GK', rating: 83, age: 24, number: 99, club: 'PSG' },
      { id: 131, name: 'Ansu Fati', position: 'LW', rating: 81, age: 21, number: 10, club: 'Brighton' },
      { id: 132, name: 'Gavi', position: 'CM', rating: 81, age: 19, number: 6, club: 'Barcelona' },
      { id: 133, name: 'Florian Wirtz', position: 'CAM', rating: 81, age: 20, number: 27, club: 'Bayer 04' },
      { id: 134, name: 'Eduardo Camavinga', position: 'CM', rating: 81, age: 21, number: 12, club: 'Real Madrid' },
      { id: 135, name: 'Ryan Gravenberch', position: 'CM', rating: 80, age: 21, number: 38, club: 'Liverpool' },
      { id: 136, name: 'Christopher Nkunku', position: 'CAM', rating: 84, age: 26, number: 18, club: 'Chelsea' },
      { id: 137, name: 'Marcus Rashford', position: 'LW', rating: 82, age: 26, number: 10, club: 'Man United' },
      { id: 138, name: 'Darwin Núñez', position: 'ST', rating: 82, age: 24, number: 9, club: 'Liverpool' },
      { id: 139, name: 'Julián Álvarez', position: 'ST', rating: 82, age: 24, number: 19, club: 'Man City' },
      { id: 140, name: 'William Saliba', position: 'CB', rating: 82, age: 22, number: 2, club: 'Arsenal' },

      // Good Players (75-79 rating)
      { id: 141, name: 'Serge Gnabry', position: 'RW', rating: 79, age: 28, number: 7, club: 'Bayern' },
      { id: 142, name: 'Gabriel Jesus', position: 'ST', rating: 79, age: 27, number: 9, club: 'Arsenal' },
      { id: 143, name: 'Rodrygo', position: 'RW', rating: 79, age: 23, number: 11, club: 'Real Madrid' },
      { id: 144, name: 'Tchouaméni', position: 'CDM', rating: 79, age: 24, number: 18, club: 'Real Madrid' },
      { id: 145, name: 'Frenkie de Jong', position: 'CM', rating: 82, age: 26, number: 21, club: 'Barcelona' },
      { id: 146, name: 'Jack Grealish', position: 'LW', rating: 82, age: 28, number: 10, club: 'Man City' },
      { id: 147, name: 'Rúben Dias', position: 'CB', rating: 84, age: 26, number: 3, club: 'Man City' },
      { id: 148, name: 'Erling Haaland', position: 'ST', rating: 90, age: 23, number: 9, club: 'Man City' },
      { id: 149, name: 'Bruno Fernandes', position: 'CAM', rating: 83, age: 29, number: 18, club: 'Man United' },
      { id: 150, name: 'Kai Havertz', position: 'CAM', rating: 81, age: 24, number: 29, club: 'Arsenal' },

      // Mid-tier Players (70-74 rating)
      { id: 151, name: 'Ben White', position: 'CB', rating: 79, age: 26, number: 4, club: 'Arsenal' },
      { id: 152, name: 'Gabriel Martinelli', position: 'LW', rating: 79, age: 22, number: 11, club: 'Arsenal' },
      { id: 153, name: 'Mateo Kovačić', position: 'CM', rating: 82, age: 29, number: 8, club: 'Man City' },
      { id: 154, name: 'Thiago Silva', position: 'CB', rating: 81, age: 39, number: 6, club: 'Chelsea' },
      { id: 155, name: 'Reece James', position: 'RB', rating: 81, age: 24, number: 24, club: 'Chelsea' },
      { id: 156, name: 'Cole Palmer', position: 'CAM', rating: 78, age: 21, number: 20, club: 'Chelsea' },
      { id: 157, name: 'Malo Gusto', position: 'RB', rating: 74, age: 20, number: 27, club: 'Chelsea' },
      { id: 158, name: 'Enzo Fernández', position: 'CM', rating: 81, age: 23, number: 5, club: 'Chelsea' },
      { id: 159, name: 'Moisés Caicedo', position: 'CDM', rating: 79, age: 22, number: 25, club: 'Chelsea' },
      { id: 160, name: 'Nicolas Jackson', position: 'ST', rating: 76, age: 22, number: 15, club: 'Chelsea' },
      { id: 161, name: 'Mykhaylo Mudryk', position: 'LW', rating: 76, age: 23, number: 10, club: 'Chelsea' },
      { id: 162, name: 'Raheem Sterling', position: 'RW', rating: 81, age: 29, number: 7, club: 'Chelsea' },
      { id: 163, name: 'Conor Gallagher', position: 'CM', rating: 78, age: 24, number: 23, club: 'Chelsea' },
      { id: 164, name: 'Levi Colwill', position: 'CB', rating: 76, age: 21, number: 26, club: 'Chelsea' },
      { id: 165, name: 'Ben Chilwell', position: 'LB', rating: 79, age: 27, number: 21, club: 'Chelsea' },
      { id: 166, name: 'Martin Ødegaard', position: 'CAM', rating: 84, age: 25, number: 8, club: 'Arsenal' },
      { id: 167, name: 'Thomas Partey', position: 'CDM', rating: 80, age: 30, number: 5, club: 'Arsenal' },
      { id: 168, name: 'Gabriel Magalhães', position: 'CB', rating: 81, age: 26, number: 6, club: 'Arsenal' },
      { id: 169, name: 'Oleksandr Zinchenko', position: 'LB', rating: 79, age: 27, number: 35, club: 'Arsenal' },
      { id: 170, name: 'Aaron Ramsdale', position: 'GK', rating: 79, age: 25, number: 1, club: 'Arsenal' },
      { id: 171, name: 'Leandro Trossard', position: 'LW', rating: 79, age: 29, number: 19, club: 'Arsenal' },
      { id: 172, name: 'Fabio Vieira', position: 'CAM', rating: 76, age: 24, number: 21, club: 'Arsenal' },
      { id: 173, name: 'Takehiro Tomiyasu', position: 'RB', rating: 78, age: 25, number: 18, club: 'Arsenal' },
      { id: 174, name: 'Jakub Kiwior', position: 'CB', rating: 74, age: 24, number: 15, club: 'Arsenal' },
      { id: 175, name: 'Emile Smith Rowe', position: 'CAM', rating: 76, age: 23, number: 32, club: 'Arsenal' },
      { id: 176, name: 'Bernardo Silva', position: 'RW', rating: 85, age: 29, number: 20, club: 'Man City' },
      { id: 177, name: 'Ilkay Gündogan', position: 'CM', rating: 83, age: 33, number: 19, club: 'Barcelona' },
      { id: 178, name: 'John Stones', position: 'CB', rating: 82, age: 29, number: 5, club: 'Man City' },
      { id: 179, name: 'Kyle Walker', position: 'RB', rating: 82, age: 33, number: 2, club: 'Man City' },
      { id: 180, name: 'Rodri', position: 'CDM', rating: 85, age: 27, number: 16, club: 'Man City' },
      { id: 181, name: 'Jeremy Doku', position: 'LW', rating: 77, age: 21, number: 11, club: 'Man City' },
      { id: 182, name: 'Manuel Akanji', position: 'CB', rating: 80, age: 28, number: 25, club: 'Man City' },
      { id: 183, name: 'Nathan Aké', position: 'CB', rating: 79, age: 28, number: 6, club: 'Man City' },
      { id: 184, name: 'Josko Gvardiol', position: 'LB', rating: 79, age: 22, number: 24, club: 'Man City' },
      { id: 185, name: 'Ederson', position: 'GK', rating: 84, age: 30, number: 31, club: 'Man City' },
      { id: 186, name: 'Cody Gakpo', position: 'LW', rating: 80, age: 24, number: 18, club: 'Liverpool' },
      { id: 187, name: 'Luis Díaz', position: 'LW', rating: 81, age: 27, number: 7, club: 'Liverpool' },
      { id: 188, name: 'Dominik Szoboszlai', position: 'CM', rating: 80, age: 23, number: 8, club: 'Liverpool' },
      { id: 189, name: 'Alexis Mac Allister', position: 'CM', rating: 80, age: 25, number: 10, club: 'Liverpool' },
      { id: 190, name: 'Andy Robertson', position: 'LB', rating: 82, age: 30, number: 26, club: 'Liverpool' },
      { id: 191, name: 'Trent Alexander-Arnold', position: 'RB', rating: 83, age: 25, number: 66, club: 'Liverpool' },
      { id: 192, name: 'Ibrahima Konaté', position: 'CB', rating: 80, age: 24, number: 5, club: 'Liverpool' },
      { id: 193, name: 'Joel Matip', position: 'CB', rating: 78, age: 32, number: 32, club: 'Liverpool' },
      { id: 194, name: 'Caoimhin Kelleher', position: 'GK', rating: 74, age: 25, number: 62, club: 'Liverpool' },
      { id: 195, name: 'Diogo Jota', position: 'ST', rating: 82, age: 27, number: 20, club: 'Liverpool' },
      { id: 196, name: 'Curtis Jones', position: 'CM', rating: 76, age: 23, number: 17, club: 'Liverpool' },
      { id: 197, name: 'Harvey Elliott', position: 'RW', rating: 74, age: 21, number: 19, club: 'Liverpool' },
      { id: 198, name: 'Ben Doak', position: 'RW', rating: 70, age: 18, number: 50, club: 'Liverpool' },
      { id: 199, name: 'Jarell Quansah', position: 'CB', rating: 72, age: 21, number: 78, club: 'Liverpool' },
      { id: 200, name: 'Conor Bradley', position: 'RB', rating: 71, age: 20, number: 84, club: 'Liverpool' }
    ];
    // Add calculated values to all players
    return players.map(player => ({
      ...player,
      value: calculatePlayerValue(player.rating, player.age)
    }));
  })());

  const formations = {
    '4-3-3': [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LB', x: 15, y: 75 },
      { pos: 'CB', x: 35, y: 75 },
      { pos: 'CB', x: 65, y: 75 },
      { pos: 'RB', x: 85, y: 75 },
      { pos: 'CM', x: 25, y: 50 },
      { pos: 'CM', x: 50, y: 50 },
      { pos: 'CM', x: 75, y: 50 },
      { pos: 'LW', x: 15, y: 25 },
      { pos: 'ST', x: 50, y: 25 },
      { pos: 'RW', x: 85, y: 25 }
    ],
    '4-4-2': [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LB', x: 15, y: 75 },
      { pos: 'CB', x: 35, y: 75 },
      { pos: 'CB', x: 65, y: 75 },
      { pos: 'RB', x: 85, y: 75 },
      { pos: 'LM', x: 15, y: 50 },
      { pos: 'CM', x: 35, y: 50 },
      { pos: 'CM', x: 65, y: 50 },
      { pos: 'RM', x: 85, y: 50 },
      { pos: 'ST', x: 35, y: 25 },
      { pos: 'ST', x: 65, y: 25 }
    ],
    '3-5-2': [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'CB', x: 25, y: 75 },
      { pos: 'CB', x: 50, y: 75 },
      { pos: 'CB', x: 75, y: 75 },
      { pos: 'LM', x: 10, y: 50 },
      { pos: 'CM', x: 30, y: 50 },
      { pos: 'CM', x: 50, y: 50 },
      { pos: 'CM', x: 70, y: 50 },
      { pos: 'RM', x: 90, y: 50 },
      { pos: 'ST', x: 35, y: 25 },
      { pos: 'ST', x: 65, y: 25 }
    ]
  };

  const saveUserData = async (userData) => {
    if (user?.uid) {
      await updateUserProfile(user.uid, userData);
    }
    setUser({ ...user, ...userData });
  };

  const saveSquadData = async (squadData) => {
    if (user?.uid) {
      await saveUserSquad(user.uid, squadData);
    }
    setSquad(squadData);
  };

  const handleLogin = async (email, password) => {
    const result = await loginUser(email, password);
    if (result.success) {
      // Firebase auth state listener will handle the login flow
    } else {
      alert(`Login failed: ${result.error}`);
    }
  };

  const handleRegister = async (email, password, displayName) => {
    const result = await registerUser(email, password, displayName);
    if (result.success) {
      // Firebase auth state listener will handle the registration flow
    } else {
      alert(`Registration failed: ${result.error}`);
    }
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      // Firebase auth state listener will handle the logout flow
    } else {
      alert(`Logout failed: ${result.error}`);
    }
  };

  const handleSendFriendRequest = async (friendId) => {
    if (!friendId.trim()) {
      alert('Please enter a valid user ID');
      return;
    }

    const result = await sendFriendRequest(user.uid, friendId.trim(), user.name);
    if (result.success) {
      alert('Friend request sent successfully!');
    } else {
      alert(`Failed to send friend request: ${result.error}`);
    }
  };

  const handleAcceptFriendRequest = async (requestId, friendId) => {
    const result = await acceptFriendRequest(requestId, user.uid, friendId);
    if (result.success) {
      // Reload friends list
      const friendsResult = await getUserFriends(user.uid);
      if (friendsResult.success) {
        setFriends(friendsResult.data);
      }
      alert('Friend request accepted!');
    } else {
      alert(`Failed to accept friend request: ${result.error}`);
    }
  };

  const handleForgotPassword = async (email) => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    const result = await resetPassword(email.trim());
    if (result.success) {
      alert('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
    } else {
      alert(`Failed to send reset email: ${result.error}`);
    }
  };

  const handleChallengeFriend = async (friendId, friendName) => {
    const result = await createMatch(user.uid, friendId, user.name, friendName);
    if (result.success) {
      alert(`Challenge sent to ${friendName}! They will receive a notification.`);
    } else {
      alert(`Failed to send challenge: ${result.error}`);
    }
  };

  const simulateMatch = (player1Squad, player2Squad) => {
    const getSquadRating = (squad) => {
      const squadArray = Object.values(squad).filter(player => player);
      if (squadArray.length === 0) return 70;
      return squadArray.reduce((sum, player) => sum + player.rating, 0) / squadArray.length;
    };

    const player1Rating = getSquadRating(player1Squad);
    const player2Rating = getSquadRating(player2Squad);

    const randomFactor = Math.random() * 20 - 10;
    const ratingDifference = player1Rating - player2Rating + randomFactor;

    let player1Goals = Math.floor(Math.random() * 4);
    let player2Goals = Math.floor(Math.random() * 4);

    if (ratingDifference > 5) {
      player1Goals += Math.floor(Math.random() * 2);
    } else if (ratingDifference < -5) {
      player2Goals += Math.floor(Math.random() * 2);
    }

    return {
      player1Goals: Math.max(0, player1Goals),
      player2Goals: Math.max(0, player2Goals),
      player1Rating: Math.round(player1Rating),
      player2Rating: Math.round(player2Rating)
    };
  };

  const validateSquad = (squad) => {
    const players = Object.values(squad).filter(player => player && player.name);
    return players.length === 11;
  };

  const generateMatchEvents = (mySquad, opponentSquad, matchId, opponentName) => {
    const events = [];
    const mySquadArray = Object.values(mySquad).filter(p => p);
    const opponentSquadArray = Object.values(opponentSquad).filter(p => p);

    const myRating = mySquadArray.reduce((sum, p) => sum + p.rating, 0) / mySquadArray.length;
    const oppRating = opponentSquadArray.reduce((sum, p) => sum + p.rating, 0) / opponentSquadArray.length;

    let myGoals = 0;
    let oppGoals = 0;

    for (let minute = 1; minute <= 90; minute += Math.floor(Math.random() * 15) + 5) {
      if (Math.random() < 0.15) {
        const isMyGoal = Math.random() < (myRating / (myRating + oppRating));
        const scorer = isMyGoal ?
          mySquadArray[Math.floor(Math.random() * mySquadArray.length)] :
          opponentSquadArray[Math.floor(Math.random() * opponentSquadArray.length)];

        if (isMyGoal) {
          myGoals++;
          events.push({
            minute,
            type: 'goal',
            team: 'home',
            player: scorer.name,
            text: `⚽ GOAL! ${scorer.name} scores for your team!`
          });
        } else {
          oppGoals++;
          events.push({
            minute,
            type: 'goal',
            team: 'away',
            player: scorer.name,
            text: `⚽ Goal for ${opponentName} by ${scorer.name}`
          });
        }
      } else if (Math.random() < 0.3) {
        const isMyTeam = Math.random() < 0.5;
        const player = isMyTeam ?
          mySquadArray[Math.floor(Math.random() * mySquadArray.length)] :
          opponentSquadArray[Math.floor(Math.random() * opponentSquadArray.length)];

        const eventTypes = ['shot', 'pass', 'tackle', 'save'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        events.push({
          minute,
          type: eventType,
          team: isMyTeam ? 'home' : 'away',
          player: player.name,
          text: `${minute}' - ${player.name} ${eventType === 'shot' ? 'takes a shot' :
                 eventType === 'pass' ? 'makes a great pass' :
                 eventType === 'tackle' ? 'makes a tackle' : 'makes a save'}`
        });
      }
    }

    return { events, myGoals, oppGoals };
  };

  const handleAcceptMatch = async (matchId, opponentId, opponentName) => {
    try {
      const opponentSquadResult = await getUserSquad(opponentId);
      const mySquadResult = await getUserSquad(user.uid);

      const mySquad = mySquadResult.success ? mySquadResult.data : formationPlayers;
      const opponentSquad = opponentSquadResult.success ? opponentSquadResult.data : {};

      if (!validateSquad(mySquad)) {
        alert('You need exactly 11 players in your formation to start a match! Please go to the Formation tab and complete your squad.');
        return;
      }

      if (!validateSquad(opponentSquad)) {
        alert(`${opponentName} doesn't have a complete squad (11 players). Match cannot start.`);
        return;
      }

      const matchData = generateMatchEvents(mySquad, opponentSquad, matchId, opponentName);

      setMatchSimulation({
        matchId,
        opponentId,
        opponentName,
        mySquad,
        opponentSquad,
        events: matchData.events,
        finalScore: {
          home: matchData.myGoals,
          away: matchData.oppGoals
        }
      });

      setMatchEvents([]);
      setCurrentMinute(0);
      setIsMatchPlaying(false);
      setCurrentScreen('match');

    } catch (error) {
      alert(`Failed to start match: ${error.message}`);
    }
  };

  const handleDeclineMatch = async (matchId) => {
    try {
      await updateMatchResult(matchId, { status: 'declined' });
      setIncomingMatches(prev => prev.filter(match => match.id !== matchId));
      alert('Match declined');
    } catch (error) {
      alert(`Failed to decline match: ${error.message}`);
    }
  };

  const startMatch = () => {
    setIsMatchPlaying(true);
    setCurrentMinute(0);
    setMatchEvents([]);

    const interval = setInterval(() => {
      setCurrentMinute(prev => {
        const nextMinute = prev + 1;

        const currentEvent = matchSimulation.events.find(event => event.minute === nextMinute);
        if (currentEvent) {
          setMatchEvents(prevEvents => [...prevEvents, currentEvent]);
        }

        if (nextMinute >= 90) {
          clearInterval(interval);
          setIsMatchPlaying(false);
          setTimeout(() => finishMatch(), 2000);
          return 90;
        }

        return nextMinute;
      });
    }, 100);
  };

  const finishMatch = async () => {
    try {
      const matchResult = {
        player1Goals: matchSimulation.finalScore.away,
        player2Goals: matchSimulation.finalScore.home,
        player1Rating: Math.round(Object.values(matchSimulation.opponentSquad).reduce((sum, p) => sum + p.rating, 0) / 11),
        player2Rating: Math.round(Object.values(matchSimulation.mySquad).reduce((sum, p) => sum + p.rating, 0) / 11),
        winner: matchSimulation.finalScore.home > matchSimulation.finalScore.away ? 'player2' :
                matchSimulation.finalScore.away > matchSimulation.finalScore.home ? 'player1' : 'draw'
      };

      await updateMatchResult(matchSimulation.matchId, matchResult);

      const winnerText = matchResult.winner === 'player1' ? matchSimulation.opponentName :
                        matchResult.winner === 'player2' ? 'You' : 'Draw';

      alert(`Match completed!\n${matchSimulation.opponentName} ${matchSimulation.finalScore.away} - ${matchSimulation.finalScore.home} You\nWinner: ${winnerText}`);

      setIncomingMatches(prev => prev.filter(match => match.id !== matchSimulation.matchId));
      setMatchSimulation(null);
      setCurrentScreen('alerts');

    } catch (error) {
      alert(`Failed to save match result: ${error.message}`);
    }
  };

  const selectPosition = (index) => {
    setSelectedPosition(index);
    setShowPlayerModal(true);
  };

  const assignPlayer = (player) => {
    // Check if player is already assigned to another position
    const currentPositions = Object.keys(formationPlayers);
    const existingPosition = currentPositions.find(pos =>
      formationPlayers[pos] && formationPlayers[pos].id === player.id
    );

    const newFormationPlayers = { ...formationPlayers };

    // If player is already assigned, remove from previous position
    if (existingPosition && existingPosition !== selectedPosition.toString()) {
      newFormationPlayers[existingPosition] = null;
    }

    newFormationPlayers[selectedPosition] = player;
    setFormationPlayers(newFormationPlayers);
    setShowPlayerModal(false);
  };

  // Helper function to format prices
  const formatPrice = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const autoFillFormation = () => {
    const positionsByRole = {
      'GK': ['GK'],
      'CB': ['CB', 'LCB', 'RCB'],
      'LB': ['LB', 'LWB'],
      'RB': ['RB', 'RWB'],
      'CDM': ['CDM', 'DM'],
      'CM': ['CM'],
      'CAM': ['CAM', 'AM'],
      'LM': ['LM', 'LW'],
      'RM': ['RM', 'RW'],
      'LW': ['LW', 'LM'],
      'RW': ['RW', 'RM'],
      'ST': ['ST', 'CF']
    };

    const getPlayersByPosition = (position) => {
      const compatiblePositions = positionsByRole[position] || [position];
      return squad.filter(player =>
        compatiblePositions.some(pos =>
          player.position.includes(pos) ||
          pos.includes(player.position)
        )
      ).sort((a, b) => b.rating - a.rating);
    };

    const newFormationPlayers = {};
    const usedPlayers = new Set();

    formations[formation].forEach((position, index) => {
      const availablePlayers = getPlayersByPosition(position.pos).filter(player =>
        !usedPlayers.has(player.id)
      );

      if (availablePlayers.length > 0) {
        const bestPlayer = availablePlayers[0];
        newFormationPlayers[index] = bestPlayer;
        usedPlayers.add(bestPlayer.id);
      }
    });

    setFormationPlayers(newFormationPlayers);
  };

  const signPlayer = (player) => {
    if ((user.budget || 0) >= player.value) {
      const newSquad = [...squad, { ...player, number: Math.floor(Math.random() * 99) + 1 }];
      const updatedUser = { ...user, budget: user.budget - player.value };
      saveSquadData(newSquad);
      saveUserData(updatedUser);
      alert(`Successfully signed ${player.name} for $${player.value.toLocaleString()}!`);
    } else {
      alert(`Not enough budget! You need $${player.value.toLocaleString()} but only have $${user.budget.toLocaleString()}.`);
    }
  };

  const sellPlayer = (player) => {
    if (window.confirm(`Are you sure you want to sell ${player.name}?`)) {
      // Calculate sell price (85% of original value, or 90% if player was trained)
      const wasTrained = player.rating > (player.originalRating || player.rating);
      const sellPrice = Math.floor(player.value * (wasTrained ? 0.9 : 0.85));

      // Remove player from squad
      const newSquad = squad.filter(p => p.id !== player.id);

      // Remove player from formation if assigned
      const newFormationPlayers = { ...formationPlayers };
      Object.keys(newFormationPlayers).forEach(pos => {
        if (newFormationPlayers[pos] && newFormationPlayers[pos].id === player.id) {
          newFormationPlayers[pos] = null;
        }
      });

      // Update user budget
      const updatedUser = { ...user, budget: user.budget + sellPrice };

      // Save changes
      saveSquadData(newSquad);
      setFormationPlayers(newFormationPlayers);
      saveUserData(updatedUser);

      alert(`Successfully sold ${player.name} for $${sellPrice.toLocaleString()}!`);
    }
  };

  // Mock manager data for leaderboard
  const leaderboardManagers = [
    {
      id: '1',
      name: user?.name || 'Player',
      clubName: user?.clubName || 'My Club',
      points: 1800,
      isCurrentUser: true,
      level: user?.level || 1,
      budget: user?.budget || 0,
      trophies: user?.trophies || 0,
      squad: squad.slice(0, 11) // Show first 11 players as starting XI
    },
    {
      id: '2',
      name: 'Manager Elite',
      clubName: 'Elite FC',
      points: 1750,
      isCurrentUser: false,
      level: 8,
      budget: 180000000,
      trophies: 5,
      squad: transferPlayers.slice(0, 11).map(p => ({...p, rating: p.rating + Math.floor(Math.random() * 5)}))
    },
    {
      id: '3',
      name: 'Football Boss',
      clubName: 'Boss United',
      points: 1700,
      isCurrentUser: false,
      level: 7,
      budget: 160000000,
      trophies: 3,
      squad: transferPlayers.slice(11, 22).map(p => ({...p, rating: p.rating + Math.floor(Math.random() * 4)}))
    }
  ];

  const showManagerProfile = (manager) => {
    setSelectedManager(manager);
    setShowManagerModal(true);
  };

  // Formation saving functionality
  const saveFormation = async () => {
    if (!user?.uid) return;

    try {
      const formationData = {
        formation,
        formationPlayers,
        savedAt: new Date().toISOString()
      };

      await firestore().collection('users').doc(user.uid).collection('formations').doc('current').set(formationData);
      alert('Formation saved successfully!');
    } catch (error) {
      console.error('Error saving formation:', error);
      alert('Failed to save formation. Please try again.');
    }
  };

  const loadFormation = async () => {
    if (!user?.uid) return;

    try {
      const formationDoc = await firestore().collection('users').doc(user.uid).collection('formations').doc('current').get();

      if (formationDoc.exists) {
        const formationData = formationDoc.data();
        setFormation(formationData.formation);
        setFormationPlayers(formationData.formationPlayers);
        alert('Formation loaded successfully!');
      } else {
        alert('No saved formation found.');
      }
    } catch (error) {
      console.error('Error loading formation:', error);
      alert('Failed to load formation. Please try again.');
    }
  };

  const openPlayerDetail = (player) => {
    // Generate random skills if not present
    const playerWithSkills = {
      ...player,
      skills: player.skills || generatePlayerSkills(player.position),
      potential: player.potential || Math.min(99, player.rating + Math.floor(Math.random() * 10) + 5),
      age: player.age || Math.floor(Math.random() * 15) + 18,
      experience: player.experience || Math.floor(Math.random() * player.rating / 5)
    };
    setSelectedPlayer(playerWithSkills);
    setShowPlayerDetail(true);
  };

  const generatePlayerSkills = (position) => {
    const baseSkills = {
      pace: Math.floor(Math.random() * 40) + 60,
      shooting: Math.floor(Math.random() * 40) + 60,
      passing: Math.floor(Math.random() * 40) + 60,
      dribbling: Math.floor(Math.random() * 40) + 60,
      defending: Math.floor(Math.random() * 40) + 60,
      physical: Math.floor(Math.random() * 40) + 60
    };

    // Adjust skills based on position
    switch(position) {
      case 'GK':
        baseSkills.shooting = Math.floor(Math.random() * 20) + 30;
        baseSkills.dribbling = Math.floor(Math.random() * 20) + 40;
        baseSkills.defending = Math.floor(Math.random() * 30) + 70;
        break;
      case 'CB':
      case 'LCB':
      case 'RCB':
        baseSkills.defending = Math.floor(Math.random() * 20) + 80;
        baseSkills.physical = Math.floor(Math.random() * 20) + 80;
        baseSkills.shooting = Math.floor(Math.random() * 30) + 40;
        break;
      case 'LB':
      case 'RB':
        baseSkills.pace = Math.floor(Math.random() * 20) + 80;
        baseSkills.defending = Math.floor(Math.random() * 20) + 70;
        break;
      case 'CDM':
      case 'CM':
        baseSkills.passing = Math.floor(Math.random() * 20) + 80;
        baseSkills.defending = Math.floor(Math.random() * 20) + 70;
        break;
      case 'CAM':
        baseSkills.passing = Math.floor(Math.random() * 20) + 80;
        baseSkills.dribbling = Math.floor(Math.random() * 20) + 80;
        break;
      case 'LW':
      case 'RW':
        baseSkills.pace = Math.floor(Math.random() * 20) + 80;
        baseSkills.dribbling = Math.floor(Math.random() * 20) + 80;
        break;
      case 'ST':
        baseSkills.shooting = Math.floor(Math.random() * 20) + 80;
        baseSkills.physical = Math.floor(Math.random() * 20) + 75;
        break;
    }

    return baseSkills;
  };

  const improvePlayerSkill = (skillName) => {
    const improvementCost = 100000;
    if (user.budget >= improvementCost) {
      const updatedPlayer = { ...selectedPlayer };
      updatedPlayer.skills[skillName] = Math.min(99, updatedPlayer.skills[skillName] + 1);
      updatedPlayer.rating = Math.ceil(Object.values(updatedPlayer.skills).reduce((a, b) => a + b) / 6);

      // Update in squad if player is in squad
      const updatedSquad = squad.map(p => p.id === selectedPlayer.id ? updatedPlayer : p);
      setSquad(updatedSquad);
      saveSquadData(updatedSquad);

      const updatedUser = { ...user, budget: user.budget - improvementCost };
      setUser(updatedUser);
      saveUserData(updatedUser);

      setSelectedPlayer(updatedPlayer);
      alert(`${skillName} improved to ${updatedPlayer.skills[skillName]}! Rating is now ${updatedPlayer.rating}.`);
    } else {
      alert(`Not enough budget! Training costs $${improvementCost.toLocaleString()}.`);
    }
  };

  const startEditingProfile = () => {
    setEditingProfile(true);
    setEditName(user.name);
    setEditClubName(user.clubName);
  };

  const saveProfileChanges = () => {
    const updatedUser = { ...user, name: editName, clubName: editClubName };
    saveUserData(updatedUser);
    setEditingProfile(false);
    alert('Profile updated successfully!');
  };

  const cancelProfileEdit = () => {
    setEditingProfile(false);
    setEditName('');
    setEditClubName('');
  };

  const isPositionCompatible = (playerPos, formPos) => {
    const compatibility = {
      'GK': ['GK'],
      'CB': ['CB', 'LB', 'RB'],
      'LB': ['LB', 'CB', 'LM'],
      'RB': ['RB', 'CB', 'RM'],
      'CDM': ['CDM', 'CM'],
      'CM': ['CM', 'CDM', 'CAM'],
      'CAM': ['CAM', 'CM'],
      'LM': ['LM', 'LB', 'LW'],
      'RM': ['RM', 'RB', 'RW'],
      'LW': ['LW', 'LM', 'ST'],
      'RW': ['RW', 'RM', 'ST'],
      'ST': ['ST', 'LW', 'RW']
    };

    return compatibility[playerPos]?.includes(formPos) || false;
  };

  const screens = {
    auth: () => (
      <div className="auth-container">
        <div className="auth-card">
          <h1>
          <span className="logo-icon">
            <span className="football-icon">⚽</span>
            <span className="crown-icon">👑</span>
          </span>
          Football Manager Pro
        </h1>
          <div className="auth-tabs">
            <button
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');

            if (authMode === 'login') {
              handleLogin(email, password);
            } else {
              const displayName = formData.get('displayName');
              handleRegister(email, password, displayName);
            }
          }}>
            {authMode === 'register' && (
              <input
                type="text"
                name="displayName"
                placeholder="Display Name"
                required
                className="auth-input"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="auth-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="auth-input"
            />
            <button type="submit" className="auth-button">
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          {authMode === 'login' && (
            <div style={{marginTop: '15px', textAlign: 'center'}}>
              <button
                type="button"
                onClick={() => {
                  const email = document.querySelector('input[name="email"]').value;
                  if (email) {
                    handleForgotPassword(email);
                  } else {
                    const userEmail = prompt('Enter your email address:');
                    if (userEmail) {
                      handleForgotPassword(userEmail);
                    }
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2196F3',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <p className="auth-info">Join the ultimate football management experience</p>
        </div>
      </div>
    ),
    dashboard: () => (
      <div className="screen">
        <h2>Dashboard</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Club</h3>
            <p>{user.clubName}</p>
          </div>
          <div className="stat-card">
            <h3>Level</h3>
            <p>{user.level}</p>
          </div>
          <div className="stat-card">
            <h3>Budget (USD)</h3>
            <p>{(user.budget || 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Trophies</h3>
            <p>{user.trophies}</p>
          </div>
        </div>
      </div>
    ),
    squad: () => (
      <div className="screen">
        <h2>My Squad</h2>
        <div className="player-list">
          {squad.map(player => {
            const wasTrained = player.rating > (player.originalRating || player.rating);
            const sellPrice = Math.floor(player.value * (wasTrained ? 0.9 : 0.85));

            return (
              <div key={player.id} className="player-card">
                <div className="player-info">
                  <h4
                    style={{cursor: 'pointer', color: '#007bff'}}
                    onClick={() => openPlayerDetail(player)}
                  >
                    {player.name}
                  </h4>
                  <p>{player.position} • Rating: {player.rating}</p>
                  <p>Value: ${player.value.toLocaleString()}</p>
                  <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>
                    Sell for: ${sellPrice.toLocaleString()} {wasTrained && '(+5% trained bonus)'}
                  </p>
                </div>
                <button
                  className="sell-btn"
                  onClick={() => sellPlayer(player)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    marginLeft: '10px'
                  }}
                >
                  Sell Player
                </button>
              </div>
            );
          })}
          {squad.length === 0 && (
            <p>No players in your squad. Go to Transfer Market to sign some players!</p>
          )}
        </div>
      </div>
    ),
    formation: () => (
      <div className="screen">
        <h2>Formation & Tactics</h2>
        <div className="formation-selector">
          {Object.keys(formations).map(formKey => (
            <button
              key={formKey}
              className={`formation-btn ${formation === formKey ? 'active' : ''}`}
              onClick={() => {
                setFormation(formKey);
                setFormationPlayers({});
              }}
            >
              {formKey}
            </button>
          ))}
        </div>
        <div style={{textAlign: 'center', marginBottom: '20px'}}>
          <button
            onClick={autoFillFormation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            🤖 Auto-Fill Best XI
          </button>
          <button
            onClick={() => setFormationPlayers({})}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🗑️ Clear Formation
          </button>
        </div>
        <div style={{textAlign: 'center', marginBottom: '20px'}}>
          <button
            onClick={saveFormation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            💾 Save Formation
          </button>
          <button
            onClick={loadFormation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            📁 Load Formation
          </button>
        </div>
        <div className="pitch">
          {/* Goal areas */}
          <div className="goal-area-top"></div>
          <div className="goal-area-bottom"></div>
          <div className="small-goal-area-top"></div>
          <div className="small-goal-area-bottom"></div>

          {/* Goal lines */}
          <div className="goal-line-top"></div>
          <div className="goal-line-bottom"></div>

          {/* Corner arcs */}
          <div className="corner-arc top-left"></div>
          <div className="corner-arc top-right"></div>
          <div className="corner-arc bottom-left"></div>
          <div className="corner-arc bottom-right"></div>
          {formations[formation].map((position, index) => {
            const player = formationPlayers[index];
            return (
              <div
                key={index}
                className={`position ${player ? 'filled' : ''}`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => selectPosition(index)}
              >
                {player ? (
                  <>
                    <div style={{fontSize: '12px', fontWeight: 'bold', color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{player.number}</div>
                    <div style={{fontSize: '8px', fontWeight: 'bold', color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.7)', marginTop: '2px'}}>
                      {player.name.split(' ')[0]}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="position-icon">+</div>
                    <div className="position-label">{position.pos}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="bench-section">
          <h3>Available Players</h3>
          <div className="bench-players">
            {squad.filter(player => {
              const isInFormation = Object.values(formationPlayers).some(
                fp => fp && fp.id === player.id
              );
              return !isInFormation;
            }).map(player => (
              <div key={player.id} className="bench-player">
                <span className="player-name">{player.name}</span>
                <span className="player-info">{player.position} • {player.rating}</span>
              </div>
            ))}
          </div>
        </div>
        {showPlayerModal && (
          <div className="modal-overlay" onClick={() => setShowPlayerModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Select Player for {formations[formation][selectedPosition]?.pos}</h3>
              <div className="player-selection">
                {squad.map(player => {
                  const isCompatible = isPositionCompatible(
                    player.position,
                    formations[formation][selectedPosition]?.pos
                  );
                  const isAlreadyAssigned = Object.values(formationPlayers).some(
                    fp => fp && fp.id === player.id
                  );
                  return (
                    <div
                      key={player.id}
                      className={`player-option ${!isCompatible ? 'incompatible' : ''} ${isAlreadyAssigned ? 'already-assigned' : ''}`}
                      onClick={() => assignPlayer(player)}
                    >
                      <span className="player-name">{player.name}</span>
                      <span className="player-details">
                        {player.position} • Rating: {player.rating}
                      </span>
                      {!isCompatible && <span className="warning">⚠️ Position mismatch</span>}
                      {isAlreadyAssigned && <span className="warning">🔄 Already in formation</span>}
                    </div>
                  );
                })}
              </div>
              <button className="close-btn" onClick={() => setShowPlayerModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    ),
    transfers: () => {
      const availablePlayers = transferPlayers.filter(player => !squad.some(s => s.id === player.id));
      const filteredPlayers = positionFilter === 'All Positions'
        ? availablePlayers
        : availablePlayers.filter(player => {
            const positionMap = {
              'Forwards': ['ST', 'CF'],
              'Midfielders': ['CM', 'CAM', 'CDM', 'LM', 'RM'],
              'Defenders': ['CB', 'LB', 'RB', 'LWB', 'RWB'],
              'Wingers': ['LW', 'RW'],
              'Goalkeepers': ['GK']
            };
            return positionMap[positionFilter]?.includes(player.position) || false;
          });

      return (
        <div className="screen">
          <div className="transfer-header">
            <h2>Transfer Market</h2>
            <div className="player-count">
              {filteredPlayers.length} players available
            </div>
          </div>
          <div className="transfer-filters">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option>All Positions</option>
              <option>Forwards</option>
              <option>Midfielders</option>
              <option>Wingers</option>
              <option>Defenders</option>
              <option>Goalkeepers</option>
            </select>
          </div>
          <div className="player-list">
            {filteredPlayers.map(player => (
              <div key={player.id} className="player-card transfer">
                <div className="player-info">
                  <h4
                    style={{cursor: 'pointer', color: '#007bff'}}
                    onClick={() => openPlayerDetail(player)}
                  >
                    {player.name}
                  </h4>
                  <p>{player.position} • Rating: {player.rating} • Age: {player.age}</p>
                  <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)'}}>{player.club}</p>
                  <p style={{fontWeight: 'bold', color: '#28a745'}}>Price: ${formatPrice(player.value)}</p>
                </div>
                <button
                  className="sign-btn"
                  onClick={() => signPlayer(player)}
                  disabled={(user.budget || 0) < player.value}
                  style={{
                    opacity: (user.budget || 0) < player.value ? 0.5 : 1,
                    cursor: (user.budget || 0) < player.value ? 'not-allowed' : 'pointer'
                  }}
                >
                  {(user.budget || 0) >= player.value ? 'Sign Player' : 'Not Enough Budget'}
                </button>
              </div>
            ))}
            {filteredPlayers.length === 0 && (
              <p>No players available for the selected position!</p>
            )}
          </div>
        </div>
      );
    },
    matches: () => (
      <div className="screen">
        <h2>Matches</h2>
        <div className="match-options">
          <button
            className="match-btn"
            onClick={() => alert('Realistic AI matches coming soon! Full match simulation with tactics will be available in the next update.')}
          >
            Quick Match (Coming Soon)
          </button>
          <button
            className="match-btn"
            onClick={() => alert('Tournament mode coming soon!')}
          >
            Tournament
          </button>
          <button
            className="match-btn"
            onClick={() => alert('Career mode coming soon!')}
          >
            Career Mode
          </button>
        </div>
        <div className="recent-matches">
          <h3>Recent Results</h3>
          <div className="match-result">
            <p>No matches played yet</p>
            <span>Start playing to see your results here!</span>
          </div>
        </div>
      </div>
    ),
    leaderboard: () => (
      <div className="screen">
        <h2>Leaderboard</h2>
        <div className="leaderboard-list">
          {leaderboardManagers.map((manager, index) => (
            <div key={manager.id} className={`rank-item ${manager.isCurrentUser ? 'current' : ''}`}>
              <span className="rank">{index + 1}</span>
              <div className="manager-info">
                <span
                  className="name"
                  style={{
                    cursor: 'pointer',
                    color: manager.isCurrentUser ? 'inherit' : '#007bff',
                    textDecoration: manager.isCurrentUser ? 'none' : 'underline'
                  }}
                  onClick={() => showManagerProfile(manager)}
                >
                  {manager.name}
                </span>
                <span className="club-name" style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)'}}>
                  {manager.clubName}
                </span>
              </div>
              <span className="points">{manager.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    ),
    profile: () => (
      <div className="screen profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>

          {editingProfile ? (
            <div className="profile-form">
              <div className="form-group">
                <label>Manager Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Club Name</label>
                <input
                  type="text"
                  value={editClubName}
                  onChange={(e) => setEditClubName(e.target.value)}
                />
              </div>
              <div className="profile-buttons">
                <button className="btn-success" onClick={saveProfileChanges}>
                  Save Changes
                </button>
                <button className="btn-danger" onClick={cancelProfileEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-info">
                <h3>{user.name}</h3>
                <p style={{textAlign: 'center', color: '#666', marginBottom: '25px'}}>
                  Manager of {user.clubName}
                </p>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <label>Level</label>
                  <div className="value">{user.level || 1}</div>
                </div>
                <div className="profile-stat">
                  <label>Budget</label>
                  <div className="value">${(user.budget || 0).toLocaleString()}</div>
                </div>
                <div className="profile-stat">
                  <label>Trophies</label>
                  <div className="value">{user.trophies || 0} 🏆</div>
                </div>
                <div className="profile-stat">
                  <label>Matches</label>
                  <div className="value">{user.matchesPlayed || 0}</div>
                </div>
                <div className="profile-stat">
                  <label>Win Rate</label>
                  <div className="value">{user.matchesPlayed ? Math.round((user.wins || 0) / user.matchesPlayed * 100) : 0}%</div>
                </div>
              </div>

              <div className="profile-user-id">
                <strong>Your User ID:</strong>
                <div className="user-id-code">{user.uid}</div>
                <p style={{fontSize: '12px', color: '#6c757d', margin: '8px 0 0 0'}}>
                  Share this ID with friends so they can add you!
                </p>
              </div>

              <div className="profile-buttons">
                <button className="btn-primary" onClick={startEditingProfile}>
                  ✏️ Edit Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    ),
    friends: () => (
      <div className="screen friends-container">
        <div className="friends-header">
          <h2>Friends & Requests</h2>
        </div>

        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <div className="section-card friend-requests-section">
            <h3 className="section-title">
              👥 Pending Friend Requests ({friendRequests.length})
            </h3>
            <div>
              {friendRequests.map(request => (
                <div key={request.id} className="friend-request-card">
                  <div className="friend-request-info">
                    <div className="friend-request-name">
                      {request.fromName} wants to be your friend
                    </div>
                    <div className="friend-request-id">From: {request.from}</div>
                  </div>
                  <div className="friend-request-actions">
                    <button
                      className="btn-success"
                      onClick={() => handleAcceptFriendRequest(request.id, request.from)}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => alert('Decline functionality not implemented yet')}
                    >
                      ✗ Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List Section */}
        <div className="section-card friends-list-section">
          <h3 className="section-title">
            🤝 My Friends ({friends.length})
          </h3>

          {/* Search Friends */}
          {friends.length > 0 && (
            <div className="friends-search">
              <input
                type="text"
                placeholder="🔍 Search friends by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          <div className="friends-grid">
            {friends.length > 0 ? (
              friends.filter(friendId => {
                const friendName = friendsData[friendId] || (friendId.substring(0, 8) + '...');
                return friendName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       friendId.toLowerCase().includes(searchTerm.toLowerCase());
              }).map(friendId => {
                const friendName = friendsData[friendId] || (friendId.substring(0, 8) + '...');
                return (
                  <div key={friendId} className="friend-card">
                    <div className="friend-card-header">
                      <div className="friend-avatar">
                        {friendName.charAt(0).toUpperCase()}
                      </div>
                      <div className="friend-info">
                        <div className="friend-name">{friendName}</div>
                        <div className="friend-status">● Online</div>
                      </div>
                    </div>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
                      ID: {friendId.substring(0, 12)}...
                    </div>
                    <div className="friend-actions">
                      <button
                        className="btn-challenge"
                        onClick={() => handleChallengeFriend(friendId, friendName)}
                      >
                        ⚽ Challenge
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">No friends yet</div>
                <div className="empty-state-subtext">Add some friends to start playing together!</div>
              </div>
            )}
          </div>
        </div>

        {/* Add Friend Section */}
        <div className="section-card add-friend-section">
          <h3 className="section-title">➕ Add a Friend</h3>
          <div className="add-friend-help">
            Enter your friend's User ID. They can find their ID in their Profile tab.
          </div>
          <div className="add-friend-form">
            <input
              type="text"
              id="friendIdInput"
              placeholder="Enter friend's User ID"
              className="add-friend-input"
            />
            <button
              className="btn-success"
              onClick={() => {
                const friendId = document.getElementById('friendIdInput').value;
                if (friendId) {
                  handleSendFriendRequest(friendId);
                  document.getElementById('friendIdInput').value = '';
                }
              }}
            >
              Send Request
            </button>
          </div>
        </div>
      </div>
    ),
    alerts: () => (
      <div className="screen">
        <h2 style={{color: '#333'}}>Alerts & Notifications</h2>

        {/* Challenge Notifications */}
        {incomingMatches.length > 0 && (
          <div style={{marginBottom: '20px'}}>
            <h3 style={{color: '#333'}}>Incoming Match Challenges ({incomingMatches.length})</h3>
            <div className="challenge-alerts">
              {incomingMatches.map(match => (
                <div key={match.id} className="challenge-alert" style={{padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', marginBottom: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <p style={{color: '#333', margin: '0 0 5px 0', fontSize: '16px'}}><strong>⚽ {match.player1Name}</strong> challenged you to a match!</p>
                  <p style={{fontSize: '12px', color: '#666', margin: '0 0 10px 0'}}>Challenge ID: {match.id}</p>
                  <button
                    onClick={() => handleAcceptMatch(match.id, match.player1, match.player1Name)}
                    style={{padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px', cursor: 'pointer', fontWeight: 'bold'}}
                  >
                    Accept Challenge
                  </button>
                  <button
                    onClick={() => handleDeclineMatch(match.id)}
                    style={{padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                  >
                    Decline
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend Requests in Alerts */}
        {friendRequests.length > 0 && (
          <div style={{marginBottom: '20px'}}>
            <h3 style={{color: '#333'}}>Friend Requests ({friendRequests.length})</h3>
            <div className="friend-request-alerts">
              {friendRequests.map(request => (
                <div key={request.id} className="friend-request-alert" style={{padding: '15px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', marginBottom: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <p style={{color: '#333', margin: '0 0 5px 0'}}><strong>👤 {request.fromName}</strong> wants to be your friend</p>
                  <p style={{fontSize: '12px', color: '#666', margin: '0 0 10px 0'}}>From: {request.from}</p>
                  <button
                    onClick={() => handleAcceptFriendRequest(request.id, request.from)}
                    style={{padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px', cursor: 'pointer', fontWeight: 'bold'}}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => alert('Decline functionality not implemented yet')}
                    style={{padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                  >
                    Decline
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Notifications */}
        {incomingMatches.length === 0 && friendRequests.length === 0 && (
          <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
            <p style={{fontSize: '18px', marginBottom: '10px'}}>🔔 No new notifications</p>
            <p>Friend requests and match challenges will appear here.</p>
          </div>
        )}
      </div>
    ),

    match: () => (
      <div className="match-screen">
        {matchSimulation && (
          <>
            <div className="match-header" style={{textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginBottom: '20px'}}>
              <h2 style={{color: '#333', margin: '0 0 10px 0'}}>⚽ LIVE MATCH</h2>
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px'}}>
                <div style={{textAlign: 'center'}}>
                  <h3 style={{color: '#007bff', margin: '0'}}>{user.name}</h3>
                  <p style={{margin: '5px 0', color: '#666'}}>HOME</p>
                </div>
                <div style={{fontSize: '32px', fontWeight: 'bold', color: '#333', padding: '10px 20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  {matchEvents.filter(e => e.type === 'goal' && e.team === 'home').length} - {matchEvents.filter(e => e.type === 'goal' && e.team === 'away').length}
                </div>
                <div style={{textAlign: 'center'}}>
                  <h3 style={{color: '#dc3545', margin: '0'}}>{matchSimulation.opponentName}</h3>
                  <p style={{margin: '5px 0', color: '#666'}}>AWAY</p>
                </div>
              </div>
              <div style={{marginTop: '15px', fontSize: '18px', fontWeight: 'bold', color: isMatchPlaying ? '#28a745' : '#ffc107'}}>
                {isMatchPlaying ? `${currentMinute}'` : currentMinute >= 90 ? 'FULL TIME' : 'PRE-MATCH'}
              </div>
            </div>

            {!isMatchPlaying && currentMinute === 0 && (
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <button
                  onClick={startMatch}
                  style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  🚀 START MATCH
                </button>
              </div>
            )}

            <div className="match-events" style={{backgroundColor: 'white', borderRadius: '10px', padding: '20px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #e0e0e0'}}>
              <h3 style={{color: '#333', marginTop: '0', textAlign: 'center'}}>📋 MATCH EVENTS</h3>
              {matchEvents.length === 0 && (
                <p style={{textAlign: 'center', color: '#666', fontStyle: 'italic'}}>Match events will appear here...</p>
              )}
              {matchEvents.map((event, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: event.type === 'goal' ? (event.team === 'home' ? '#d4edda' : '#f8d7da') : '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${event.type === 'goal' ? (event.team === 'home' ? '#28a745' : '#dc3545') : '#6c757d'}`,
                    animation: 'slideIn 0.5s ease-in'
                  }}
                >
                  <div style={{fontWeight: 'bold', color: '#333'}}>{event.text}</div>
                  <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>{event.minute}' - {event.player}</div>
                </div>
              ))}
            </div>

            <div style={{textAlign: 'center', marginTop: '20px'}}>
              <button
                onClick={() => {
                  setMatchSimulation(null);
                  setCurrentScreen('alerts');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Alerts
              </button>
            </div>
          </>
        )}
      </div>
    )
  };

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🔥 Loading Fury FM...</h2>
          <p>Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        {screens.auth()}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="logo-icon">
            <span className="football-icon">⚽</span>
            <span className="crown-icon">👑</span>
          </span>
          Football Manager Pro
        </h1>
        <div className="header-info">
          <span>💰 ${(user.budget || 0).toLocaleString()}</span>
          <span>🏆 {user.trophies}</span>
          <button
            className="bell-btn"
            onClick={() => setCurrentScreen('alerts')}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            🔔
            {(incomingMatches.length + friendRequests.length) > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {incomingMatches.length + friendRequests.length}
              </span>
            )}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="bottom-nav">
        {Object.keys(screens).filter(screen => screen !== 'auth' && screen !== 'alerts').map(screen => {
          return (
            <button
              key={screen}
              className={`nav-btn ${currentScreen === screen ? 'active' : ''}`}
              onClick={() => setCurrentScreen(screen)}
            >
              {screen.charAt(0).toUpperCase() + screen.slice(1)}
            </button>
          );
        })}
      </nav>

      <main className="main-content">
        {screens[currentScreen]()}
      </main>

      {/* Global Player Detail Modal */}
      {showPlayerDetail && selectedPlayer && (
        <div className="modal-overlay" onClick={() => setShowPlayerDetail(false)}>
          <div className="modal-content player-detail-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedPlayer.name}</h3>
            <div className="player-detail-grid">
              <div className="player-basic-info">
                <div className="info-item">
                  <label>Position:</label>
                  <span>{selectedPlayer.position}</span>
                </div>
                <div className="info-item">
                  <label>Overall Rating:</label>
                  <span style={{color: '#007bff', fontWeight: 'bold'}}>{selectedPlayer.rating}</span>
                </div>
                <div className="info-item">
                  <label>Age:</label>
                  <span>{selectedPlayer.age}</span>
                </div>
                <div className="info-item">
                  <label>Value:</label>
                  <span>${formatPrice(selectedPlayer.value)}</span>
                </div>
                <div className="info-item">
                  <label>Potential:</label>
                  <span style={{color: '#28a745', fontWeight: 'bold'}}>{selectedPlayer.potential}</span>
                </div>
                <div className="info-item">
                  <label>Experience:</label>
                  <span>{selectedPlayer.experience}</span>
                </div>
              </div>

              <div className="player-skills">
                <h4>Skills & Development</h4>
                <div className="skills-grid">
                  {Object.entries(selectedPlayer.skills || {}).map(([skill, value]) => (
                    <div key={skill} className="skill-item">
                      <div className="skill-header">
                        <label>{skill.charAt(0).toUpperCase() + skill.slice(1)}:</label>
                        <span className="skill-value">{value}</span>
                      </div>
                      <div className="skill-progress">
                        <div
                          className="skill-bar"
                          style={{width: `${value}%`, backgroundColor: value >= 80 ? '#28a745' : value >= 60 ? '#ffc107' : '#dc3545'}}
                        ></div>
                      </div>
                      {squad.some(p => p.id === selectedPlayer.id) && (
                        <button
                          className="improve-btn"
                          onClick={() => improvePlayerSkill(skill)}
                          disabled={value >= 99}
                        >
                          {value >= 99 ? 'Max' : 'Train (+1) - 100K'}
                        </button>
                      )}
                      {!squad.some(p => p.id === selectedPlayer.id) && (
                        <span style={{color: '#888', fontSize: '12px'}}>
                          Sign player to train
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setShowPlayerDetail(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Manager Profile Modal */}
      {showManagerModal && selectedManager && (
        <div className="modal-overlay" onClick={() => setShowManagerModal(false)}>
          <div className="modal-content player-detail-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedManager.name}</h3>
            <div className="player-detail-grid">
              <div className="player-basic-info">
                <div className="info-item">
                  <label>Club:</label>
                  <span>{selectedManager.clubName}</span>
                </div>
                <div className="info-item">
                  <label>Level:</label>
                  <span style={{color: '#007bff', fontWeight: 'bold'}}>{selectedManager.level}</span>
                </div>
                <div className="info-item">
                  <label>Points:</label>
                  <span style={{color: '#28a745', fontWeight: 'bold'}}>{selectedManager.points}</span>
                </div>
                <div className="info-item">
                  <label>Budget:</label>
                  <span>${(selectedManager.budget || 0).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <label>Trophies:</label>
                  <span style={{color: '#ffc107', fontWeight: 'bold'}}>{selectedManager.trophies} 🏆</span>
                </div>
              </div>

              <div className="player-skills">
                <h4>Squad ({selectedManager.squad.length} players)</h4>
                <div className="manager-squad-list">
                  {selectedManager.squad.map(player => (
                    <div key={player.id} className="squad-player-item">
                      <span className="player-name">{player.name}</span>
                      <span className="player-position">{player.position}</span>
                      <span className="player-rating" style={{color: '#007bff', fontWeight: 'bold'}}>
                        {player.rating}
                      </span>
                    </div>
                  ))}
                  {selectedManager.squad.length === 0 && (
                    <p style={{color: 'rgba(255,255,255,0.7)', fontStyle: 'italic'}}>
                      No players in squad
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setShowManagerModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FootballManagerPro;