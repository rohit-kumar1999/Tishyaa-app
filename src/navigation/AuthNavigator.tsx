import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f8f9fa' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}