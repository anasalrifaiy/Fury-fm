import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';

export const GestureHandlerRootView = ({ children, style, ...props }) => {
  return React.createElement(View, { style, ...props }, children);
};

export const TouchableWithoutFeedback = TouchableOpacity;
export const TouchableHighlight = TouchableOpacity;
export const TouchableNativeFeedback = TouchableOpacity;
export const PanGestureHandler = View;
export const PinchGestureHandler = View;
export const RotationGestureHandler = View;
export const FlatList = ScrollView;

export const Swipeable = ({ children, ...props }) => {
  return React.createElement(View, props, children);
};

export const DrawerLayout = ({ children, ...props }) => {
  return React.createElement(View, props, children);
};

export default {
  GestureHandlerRootView,
  TouchableWithoutFeedback,
  TouchableHighlight,
  TouchableNativeFeedback,
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  Swipeable,
  DrawerLayout,
};