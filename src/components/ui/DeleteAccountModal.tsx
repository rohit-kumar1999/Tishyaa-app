import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  userName?: string;
}

const { width } = Dimensions.get("window");

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
  loading = false,
  userName = "User",
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState<"warning" | "confirmation">("warning");

  const resetModal = () => {
    setStep("warning");
    setConfirmationText("");
  };

  const handleClose = () => {
    if (loading) return;
    resetModal();
    onClose();
  };

  const handleNextStep = () => {
    setStep("confirmation");
  };

  const handleConfirm = () => {
    if (confirmationText.toUpperCase() === "DELETE" && !loading) {
      onConfirm();
    }
  };

  const isConfirmationValid = confirmationText.toUpperCase() === "DELETE";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={32} color="#ef4444" />
              </View>
              <Text style={styles.title}>
                {step === "warning" ? "Delete Account" : "Final Confirmation"}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {step === "warning" ? (
                <>
                  <Text style={styles.subtitle}>
                    Hey {userName}, are you sure you want to delete your
                    account?
                  </Text>
                  <Text style={styles.description}>
                    This action cannot be undone and will permanently remove:
                  </Text>
                  <View style={styles.consequencesList}>
                    <View style={styles.consequenceItem}>
                      <Ionicons name="close-circle" size={16} color="#ef4444" />
                      <Text style={styles.consequenceText}>
                        All your orders and history
                      </Text>
                    </View>
                    <View style={styles.consequenceItem}>
                      <Ionicons name="close-circle" size={16} color="#ef4444" />
                      <Text style={styles.consequenceText}>
                        Saved addresses and preferences
                      </Text>
                    </View>
                    <View style={styles.consequenceItem}>
                      <Ionicons name="close-circle" size={16} color="#ef4444" />
                      <Text style={styles.consequenceText}>
                        Account data and profile information
                      </Text>
                    </View>
                    <View style={styles.consequenceItem}>
                      <Ionicons name="close-circle" size={16} color="#ef4444" />
                      <Text style={styles.consequenceText}>
                        Access to your Tishyaa account
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.finalWarning}>
                    Last chance! Type "DELETE" below to permanently delete your
                    account:
                  </Text>
                  <TextInput
                    style={[
                      styles.confirmationInput,
                      isConfirmationValid && styles.confirmationInputValid,
                    ]}
                    value={confirmationText}
                    onChangeText={setConfirmationText}
                    placeholder="Type DELETE to confirm"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {confirmationText && !isConfirmationValid && (
                    <Text style={styles.validationText}>
                      Please type "DELETE" exactly as shown
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {step === "warning" ? (
                <TouchableOpacity
                  style={[styles.button, styles.continueButton]}
                  onPress={handleNextStep}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.deleteButton,
                    (!isConfirmationValid || loading) &&
                      styles.deleteButtonDisabled,
                  ]}
                  onPress={handleConfirm}
                  disabled={!isConfirmationValid || loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>DELETE ACCOUNT</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width - 32,
    maxWidth: 400,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  consequencesList: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  consequenceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  consequenceText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  finalWarning: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  confirmationInput: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  confirmationInputValid: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  validationText: {
    fontSize: 12,
    color: "#ef4444",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  continueButton: {
    backgroundColor: "#f59e0b",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  deleteButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
