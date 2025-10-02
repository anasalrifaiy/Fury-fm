// Web mock for React Native Vector Icons
import React from 'react';

const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const iconMap = {
    'soccer': '⚽',
    'home': '🏠',
    'account': '👤',
    'swap-horizontal': '↔️',
    'trophy': '🏆',
    'cog': '⚙️',
    'football': '🏈',
    'users': '👥',
    'dollar': '💰',
    'chart-line': '📈',
    'camera': '📷',
    'edit': '✏️',
    'logout': '🚪'
  };

  const emoji = iconMap[name] || '❓';

  return React.createElement('span', {
    style: {
      fontSize: size,
      color,
      lineHeight: 1,
      display: 'inline-block',
      ...style
    },
    ...props
  }, emoji);
};

export default Icon;