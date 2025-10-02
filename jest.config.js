module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@react-native|react-native|@react-navigation)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '@react-native-firebase/auth': '<rootDir>/__mocks__/@react-native-firebase/auth.js',
    '@react-native-firebase/app': '<rootDir>/__mocks__/@react-native-firebase/app.js',
    '@react-native-firebase/firestore': '<rootDir>/__mocks__/@react-native-firebase/firestore.js',
    '@react-native-firebase/database': '<rootDir>/__mocks__/@react-native-firebase/database.js',
    '@react-native-firebase/storage': '<rootDir>/__mocks__/@react-native-firebase/storage.js',
  },
};
