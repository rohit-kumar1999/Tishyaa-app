import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onDetailsChange: (details: any) => void;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'credit_card', name: 'Credit Card', icon: 'card', description: 'Visa, Mastercard, Amex' },
  { id: 'debit_card', name: 'Debit Card', icon: 'card-outline', description: 'All major banks' },
  { id: 'upi', name: 'UPI', icon: 'phone-portrait', description: 'PhonePe, Google Pay, Paytm' },
  { id: 'net_banking', name: 'Net Banking', icon: 'desktop', description: 'Online banking' },
  { id: 'cod', name: 'Cash on Delivery', icon: 'cash', description: 'Pay when you receive' },
];

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodChange,
  onDetailsChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      
      <ScrollView style={styles.methods}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethod,
            ]}
            onPress={() => onMethodChange(method.id)}
          >
            <View style={styles.methodContent}>
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedMethod === method.id ? '#dc2626' : '#6b7280'} 
              />
              <View style={styles.methodText}>
                <Text style={[
                  styles.methodName,
                  selectedMethod === method.id && styles.selectedText,
                ]}>
                  {method.name}
                </Text>
                {method.description && (
                  <Text style={styles.methodDescription}>
                    {method.description}
                  </Text>
                )}
              </View>
            </View>
            
            <Ionicons
              name={selectedMethod === method.id ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === method.id ? '#dc2626' : '#9ca3af'}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  methods: {
    maxHeight: 300,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedMethod: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodText: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectedText: {
    color: '#dc2626',
  },
  methodDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default PaymentMethods;