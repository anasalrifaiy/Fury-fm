import React from 'react';

export const createBottomTabNavigator = () => {
  const Navigator = ({ children, screenOptions, tabBarOptions, ...props }) => {
    const [activeTab, setActiveTab] = React.useState(0);
    const screens = React.Children.toArray(children);

    return React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column' } }, [
      // Content area
      React.createElement('div', {
        key: 'content',
        style: { flex: 1, overflow: 'auto' }
      }, screens[activeTab] || screens[0]),

      // Tab bar
      React.createElement('div', {
        key: 'tabbar',
        style: {
          display: 'flex',
          height: 60,
          backgroundColor: '#fff',
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'space-around',
          alignItems: 'center'
        }
      }, screens.map((screen, index) => {
        const { options = {} } = screen.props;
        const { tabBarIcon, title } = options;

        return React.createElement('div', {
          key: index,
          onClick: () => setActiveTab(index),
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '5px',
            cursor: 'pointer',
            color: activeTab === index ? '#007AFF' : '#999'
          }
        }, [
          tabBarIcon && React.createElement('div', { key: 'icon', style: { marginBottom: 2 } },
            tabBarIcon({ color: activeTab === index ? '#007AFF' : '#999', size: 20 })
          ),
          React.createElement('span', {
            key: 'label',
            style: { fontSize: 10, fontWeight: activeTab === index ? 'bold' : 'normal' }
          }, title || screen.props.name)
        ]);
      }))
    ]);
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

export default {
  createBottomTabNavigator,
};