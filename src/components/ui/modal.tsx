import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
  blur?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  transparent = true,
  blur = true,
}) => {
  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          {blur ? (
            <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={styles.overlay} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.content}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    maxWidth: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});

export { Modal };