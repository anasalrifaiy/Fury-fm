import React from 'react';

export const NavigationContainer = ({ children, ...props }) => {
  return React.createElement('div', props, children);
};

export const useNavigation = () => ({
  navigate: (screen, params) => console.log(`Navigate to ${screen}`, params),
  goBack: () => console.log('Go back'),
  setOptions: (options) => console.log('Set options', options),
  reset: (state) => console.log('Reset navigation', state),
  dispatch: (action) => console.log('Dispatch action', action),
});

export const useFocusEffect = (callback) => {
  React.useEffect(() => {
    callback();
  }, []);
};

export const useRoute = () => ({
  params: {},
  name: 'DefaultRoute',
  key: 'default-key',
});

export const useIsFocused = () => true;

export const CommonActions = {
  navigate: (name, params) => ({ type: 'NAVIGATE', payload: { name, params } }),
  goBack: () => ({ type: 'GO_BACK' }),
  reset: (state) => ({ type: 'RESET', payload: state }),
};

export const StackActions = {
  push: (name, params) => ({ type: 'PUSH', payload: { name, params } }),
  pop: (count = 1) => ({ type: 'POP', payload: { count } }),
  popToTop: () => ({ type: 'POP_TO_TOP' }),
  replace: (name, params) => ({ type: 'REPLACE', payload: { name, params } }),
};

export const TabActions = {
  jumpTo: (name, params) => ({ type: 'JUMP_TO', payload: { name, params } }),
};

export const DrawerActions = {
  openDrawer: () => ({ type: 'OPEN_DRAWER' }),
  closeDrawer: () => ({ type: 'CLOSE_DRAWER' }),
  toggleDrawer: () => ({ type: 'TOGGLE_DRAWER' }),
};

export const useNavigationState = (selector) => selector({});

export const useBackButton = () => {};
export const useDocumentTitle = () => {};
export const useLinking = () => ({});

export default {
  NavigationContainer,
  useNavigation,
  useFocusEffect,
  useRoute,
  useIsFocused,
  CommonActions,
  StackActions,
  TabActions,
  DrawerActions,
  useNavigationState,
  useBackButton,
  useDocumentTitle,
  useLinking,
};