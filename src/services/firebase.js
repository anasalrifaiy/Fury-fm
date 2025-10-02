import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

// Player name pools
export const firstNames = ['Cristiano', 'Lionel', 'Robert', 'Mohamed', 'Kevin', 
  'Sergio', 'Eden', 'Paul', 'Antoine', 'Harry', 'Marcus', 'Bruno', 'Virgil', 
  'David', 'James', 'Jack', 'Mason', 'Phil', 'Raheem', 'Jordan'];

export const lastNames = ['Ronaldo', 'Messi', 'Lewandowski', 'Salah', 'De Bruyne', 
  'Ramos', 'Hazard', 'Pogba', 'Griezmann', 'Kane', 'Rashford', 'Fernandes', 
  'Van Dijk', 'Silva', 'Rodriguez', 'Grealish', 'Mount', 'Foden', 'Sterling'];

export const generatePlayerName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

export const generateInitialSquad = async (userId) => {
  const positions = [
    { pos: 'GK', count: 2 },
    { pos: 'DEF', count: 5 },
    { pos: 'MID', count: 5 },
    { pos: 'FWD', count: 3 }
  ];
  
  const batch = firestore().batch();
  let playerNumber = 1;
  
  for (const posGroup of positions) {
    for (let i = 0; i < posGroup.count; i++) {
      const playerRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('squad')
        .doc();
      
      const rating = 65 + Math.floor(Math.random() * 15);
      const baseValue = rating > 75 ? 15000 : rating > 70 ? 10000 : 5000;
      
      batch.set(playerRef, {
        name: generatePlayerName(),
        position: posGroup.pos,
        rating: rating,
        value: baseValue + Math.floor(Math.random() * 5000),
        number: playerNumber++,
        goals: 0,
        assists: 0,
        matches: 0,
        pace: 60 + Math.floor(Math.random() * 30),
        shooting: posGroup.pos === 'FWD' ? 70 + Math.floor(Math.random() * 20) : 50 + Math.floor(Math.random() * 20),
        passing: posGroup.pos === 'MID' ? 70 + Math.floor(Math.random() * 20) : 50 + Math.floor(Math.random() * 20),
        defending: posGroup.pos === 'DEF' ? 70 + Math.floor(Math.random() * 20) : 40 + Math.floor(Math.random() * 20),
        physical: 60 + Math.floor(Math.random() * 30)
      });
    }
  }
  
  await batch.commit();
};

export { auth, firestore, database, storage };