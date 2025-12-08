import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ScrollToTopProps {
  children?: React.ReactNode;
}

// In React Native, there's no equivalent to scrolling to top of page
// Instead, we can use this component to provide a consistent interface
// and handle scroll-to-top functionality for ScrollView/FlatList components
const ScrollToTop: React.FC<ScrollToTopProps> = ({ children }) => {
  // This component is mainly for interface compatibility
  // In mobile, scroll-to-top is typically handled by individual ScrollView/FlatList components
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { ScrollToTop };