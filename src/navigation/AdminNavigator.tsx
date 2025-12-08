import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../types';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator<AdminTabParamList>();

// Placeholder screens
const DashboardScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Admin Dashboard</Text>
  </View>
);

const ProductsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Manage Products</Text>
  </View>
);

const OrdersScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Manage Orders</Text>
  </View>
);

const AnalyticsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Analytics</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Admin Settings</Text>
  </View>
);

export default function AdminNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});