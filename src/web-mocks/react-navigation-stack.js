import React from 'react';

export const createStackNavigator = () => {
  const Navigator = ({ children, screenOptions, ...props }) => {
    return React.createElement('div', { style: { flex: 1 }, ...props }, children);
  };

  const Screen = ({ children, component: Component, options, ...props }) => {
    if (Component) {
      return React.createElement(Component, props);
    }
    return children;
  };

  Navigator.Navigator = Navigator;
  Navigator.Screen = Screen;

  return Navigator;
};

export const TransitionPresets = {
  SlideFromRightIOS: {},
  ModalSlideFromBottomIOS: {},
  FadeFromBottomAndroid: {},
  RevealFromBottomAndroid: {},
  ScaleFromCenterAndroid: {},
  DefaultTransition: {},
};

export const CardStyleInterpolators = {
  forHorizontalIOS: {},
  forVerticalIOS: {},
  forModalPresentationIOS: {},
  forFadeFromBottomAndroid: {},
  forRevealFromBottomAndroid: {},
  forScaleFromCenterAndroid: {},
  forNoAnimation: {},
};

export const HeaderStyleInterpolators = {
  forUIKit: {},
  forFade: {},
  forSlideLeft: {},
  forSlideRight: {},
  forSlideUp: {},
  forNoAnimation: {},
};

export const TransitionSpecs = {
  TransitionIOSSpec: {},
  FadeInFromBottomAndroidSpec: {},
  FadeOutToBottomAndroidSpec: {},
  RevealFromBottomAndroidSpec: {},
};

export default {
  createStackNavigator,
  TransitionPresets,
  CardStyleInterpolators,
  HeaderStyleInterpolators,
  TransitionSpecs,
};