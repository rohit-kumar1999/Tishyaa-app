import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Categories':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Cart':
              iconName = focused ? 'bag' : 'bag-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#C9A961',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
        }}
      />
    </Tab.Navigator>
  );
}