// App Constants
export const APP_NAME = 'Football Manager Pro';
export const APP_VERSION = '1.0.0';

// Screen Names
export const SCREENS = {
  AUTH: 'AuthScreen',
  PROFILE: 'Profile',
  SQUAD: 'Squad',
  FORMATION: 'Formation',
  TRANSFER: 'Transfer',
  MATCH: 'Match',
  FRIENDS: 'Friends',
  LEADERBOARD: 'Leaders',
  NOTIFICATIONS: 'Alerts',
};

// Player Positions
export const POSITIONS = {
  GOALKEEPER: 'GK',
  DEFENDER: 'DEF',
  MIDFIELDER: 'MID',
  ATTACKER: 'ATT',
};

// Formation Templates
export const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      'GK',
      'DEF-L', 'DEF-CL', 'DEF-CR', 'DEF-R',
      'MID-L', 'MID-CL', 'MID-CR', 'MID-R',
      'ATT-L', 'ATT-R'
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      'GK',
      'DEF-L', 'DEF-CL', 'DEF-CR', 'DEF-R',
      'MID-L', 'MID-C', 'MID-R',
      'ATT-L', 'ATT-C', 'ATT-R'
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      'GK',
      'DEF-L', 'DEF-C', 'DEF-R',
      'MID-L', 'MID-CL', 'MID-C', 'MID-CR', 'MID-R',
      'ATT-L', 'ATT-R'
    ]
  }
};

// Player Attributes
export const ATTRIBUTES = {
  PHYSICAL: ['pace', 'strength', 'stamina', 'jumping'],
  TECHNICAL: ['dribbling', 'passing', 'shooting', 'crossing'],
  MENTAL: ['vision', 'composure', 'workRate', 'positioning'],
  GOALKEEPING: ['handling', 'reflexes', 'kicking', 'positioning']
};

// Colors
export const COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#2ECC71',
  ERROR: '#E74C3C',
  WARNING: '#F39C12',
  INFO: '#3498DB',
  LIGHT: '#ECF0F1',
  DARK: '#2C3E50',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#95A5A6',
};

// Position Colors
export const POSITION_COLORS = {
  GK: '#FF6B6B',
  DEF: '#4ECDC4',
  MID: '#45B7D1',
  ATT: '#96CEB4',
};

// Match Event Types
export const MATCH_EVENTS = {
  GOAL: 'goal',
  YELLOW_CARD: 'yellowCard',
  RED_CARD: 'redCard',
  SUBSTITUTION: 'substitution',
  INJURY: 'injury',
  OFFSIDE: 'offside',
  FOUL: 'foul',
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  PLAYERS: 'players',
  TEAMS: 'teams',
  MATCHES: 'matches',
  TRANSFERS: 'transfers',
  NOTIFICATIONS: 'notifications',
};

// Default Values
export const DEFAULTS = {
  PLAYER_RATING: 50,
  TEAM_BUDGET: 50000000, // $50M
  MAX_SQUAD_SIZE: 25,
  MIN_SQUAD_SIZE: 16,
  MATCH_DURATION: 90, // minutes
};

export default {
  APP_NAME,
  APP_VERSION,
  SCREENS,
  POSITIONS,
  FORMATIONS,
  ATTRIBUTES,
  COLORS,
  POSITION_COLORS,
  MATCH_EVENTS,
  COLLECTIONS,
  DEFAULTS,
};