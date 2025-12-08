import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderJourneyProps {
  currentStep: number;
  steps?: string[];
}

const defaultSteps = [
  'Order Placed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const OrderJourney: React.FC<OrderJourneyProps> = ({ 
  currentStep, 
  steps = defaultSteps 
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'radio-button-on';
      default:
        return 'radio-button-off';
    }
  };

  const getStepColor = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'active':
        return '#dc2626';
      default:
        return '#9ca3af';
    }
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.stepIndicator}>
            <Ionicons
              name={getStepIcon(index)}
              size={24}
              color={getStepColor(index)}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: index < currentStep ? '#10b981' : '#e5e7eb',
                  },
                ]}
              />
            )}
          </View>
          
          <Text
            style={[
              styles.stepText,
              {
                color: getStepColor(index),
                fontWeight: index <= currentStep ? '600' : '400',
              },
            ]}
          >
            {step}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'flex-start',
  },
  stepContainer: {
    alignItems: 'center',
    marginRight: 40,
    minWidth: 80,
  },
  stepIndicator: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  connector: {
    position: 'absolute',
    left: 24,
    top: 12,
    width: 40,
    height: 2,
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 80,
  },
});

export { OrderJourney };