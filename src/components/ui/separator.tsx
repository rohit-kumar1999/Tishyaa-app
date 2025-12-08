import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  style,
}) => {
  const separatorStyle = orientation === 'horizontal' 
    ? styles.horizontal 
    : styles.vertical;

  return (
    <View style={[separatorStyle, style]} />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  vertical: {
    width: 1,
    backgroundColor: '#e5e7eb',
    height: '100%',
  },
});

export { Separator };