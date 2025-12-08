import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Category'>;

export default function CategoryScreen() {
  const route = useRoute<CategoryScreenRouteProp>();
  const { categoryName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{categoryName}</Text>
      <Text style={styles.subtitle}>Products in this category</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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