import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface LabelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Label: React.FC<LabelProps> = ({
  children,
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export { Label };