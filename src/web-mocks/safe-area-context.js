import React from 'react';

export const SafeAreaProvider = ({ children }) => children;

export const SafeAreaView = ({ children, style, ...props }) => {
  return React.createElement('div', { style, ...props }, children);
};

export const useSafeAreaInsets = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: window.innerWidth || 1024,
  height: window.innerHeight || 768,
});

export const SafeAreaInsetsContext = React.createContext({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const initialWindowMetrics = {
  insets: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  frame: {
    x: 0,
    y: 0,
    width: 1024,
    height: 768,
  },
};

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext,
  initialWindowMetrics,
};