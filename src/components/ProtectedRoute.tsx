import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  fallback?: React.ReactNode;
}

// Simple protected route component for React Native
// In a real app, this would integrate with your navigation system
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated = false,
  fallback,
}) => {
  if (!isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <View style={styles.container}>
        <Text style={styles.text}>Please sign in to continue</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export { ProtectedRoute };