import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = '#dc2626',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { Loading };