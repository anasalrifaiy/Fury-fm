import { POSITION_COLORS, DEFAULTS } from './constants';

/**
 * Formats currency values for display
 * @param {number} value - The value to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

/**
 * Formats match time display
 * @param {number} minute - The minute to format
 * @returns {string} - Formatted time string
 */
export const formatMatchTime = (minute) => {
  if (minute > 90) {
    return `90+${minute - 90}'`;
  }
  return `${minute}'`;
};

/**
 * Gets color for player position
 * @param {string} position - Player position
 * @returns {string} - Color hex code
 */
export const getPositionColor = (position) => {
  if (position.includes('GK')) return POSITION_COLORS.GK;
  if (position.includes('DEF')) return POSITION_COLORS.DEF;
  if (position.includes('MID')) return POSITION_COLORS.MID;
  if (position.includes('ATT')) return POSITION_COLORS.ATT;
  return '#95A5A6';
};

/**
 * Calculates player overall rating from attributes
 * @param {Object} attributes - Player attributes object
 * @param {string} position - Player position
 * @returns {number} - Overall rating
 */
export const calculateOverallRating = (attributes, position) => {
  if (!attributes) return DEFAULTS.PLAYER_RATING;

  const weights = {
    GK: { reflexes: 0.25, handling: 0.25, positioning: 0.2, kicking: 0.15, composure: 0.15 },
    DEF: { defending: 0.3, strength: 0.2, positioning: 0.2, pace: 0.15, passing: 0.15 },
    MID: { passing: 0.25, vision: 0.2, workRate: 0.15, dribbling: 0.15, stamina: 0.15, composure: 0.1 },
    ATT: { shooting: 0.3, pace: 0.2, dribbling: 0.2, positioning: 0.15, composure: 0.15 }
  };

  const positionWeights = weights[position] || weights.MID;
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(positionWeights).forEach(([attr, weight]) => {
    if (attributes[attr]) {
      totalScore += attributes[attr] * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : DEFAULTS.PLAYER_RATING;
};

/**
 * Generates player initials from name
 * @param {string} name - Player full name
 * @returns {string} - Player initials
 */
export const getPlayerInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/**
 * Calculates age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} - Age in years
 */
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Shuffles an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generates a random player name
 * @returns {string} - Random player name
 */
export const generateRandomName = () => {
  const firstNames = ['John', 'David', 'Michael', 'James', 'Robert', 'William', 'Richard', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return `${firstName} ${lastName}`;
};

/**
 * Generates random player attributes
 * @param {string} position - Player position
 * @returns {Object} - Random attributes object
 */
export const generateRandomAttributes = (position) => {
  const baseAttributes = {
    pace: Math.floor(Math.random() * 40) + 40,
    strength: Math.floor(Math.random() * 40) + 40,
    stamina: Math.floor(Math.random() * 40) + 40,
    dribbling: Math.floor(Math.random() * 40) + 40,
    passing: Math.floor(Math.random() * 40) + 40,
    shooting: Math.floor(Math.random() * 40) + 40,
    defending: Math.floor(Math.random() * 40) + 40,
    vision: Math.floor(Math.random() * 40) + 40,
    composure: Math.floor(Math.random() * 40) + 40,
    positioning: Math.floor(Math.random() * 40) + 40,
  };

  // Adjust attributes based on position
  if (position === 'GK') {
    baseAttributes.reflexes = Math.floor(Math.random() * 30) + 60;
    baseAttributes.handling = Math.floor(Math.random() * 30) + 60;
    baseAttributes.kicking = Math.floor(Math.random() * 30) + 50;
  } else if (position === 'DEF') {
    baseAttributes.defending = Math.floor(Math.random() * 30) + 60;
    baseAttributes.strength = Math.floor(Math.random() * 30) + 60;
    baseAttributes.positioning = Math.floor(Math.random() * 30) + 60;
  } else if (position === 'MID') {
    baseAttributes.passing = Math.floor(Math.random() * 30) + 60;
    baseAttributes.vision = Math.floor(Math.random() * 30) + 60;
    baseAttributes.stamina = Math.floor(Math.random() * 30) + 60;
  } else if (position === 'ATT') {
    baseAttributes.shooting = Math.floor(Math.random() * 30) + 60;
    baseAttributes.pace = Math.floor(Math.random() * 30) + 60;
    baseAttributes.dribbling = Math.floor(Math.random() * 30) + 60;
  }

  return baseAttributes;
};

export default {
  formatCurrency,
  formatMatchTime,
  getPositionColor,
  calculateOverallRating,
  getPlayerInitials,
  calculateAge,
  isValidEmail,
  validatePassword,
  shuffleArray,
  debounce,
  generateRandomName,
  generateRandomAttributes,
};