import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HelpStackParamList } from '../types';
import { View, Text, StyleSheet } from 'react-native';

const Stack = createStackNavigator<HelpStackParamList>();

// Placeholder screens
const FAQScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>FAQ</Text>
    <Text style={styles.subtitle}>Frequently Asked Questions</Text>
  </View>
);

const TermsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Terms of Service</Text>
    <Text style={styles.subtitle}>Terms and Conditions</Text>
  </View>
);

const PrivacyScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Privacy Policy</Text>
    <Text style={styles.subtitle}>How we handle your data</Text>
  </View>
);

const SupportScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Support</Text>
    <Text style={styles.subtitle}>Contact our support team</Text>
  </View>
);

export default function HelpNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#C9A961' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});