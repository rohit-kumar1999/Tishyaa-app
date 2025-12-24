import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { TouchableOpacity } from "../common/TouchableOpacity";

export interface SelectOption {
  label: string;
  value: string;
  order?: string;
}

export interface SortOption {
  label: string;
  value: string;
  order: string;
}

export interface SelectProps<T = SelectOption> {
  options: T[];
  value?: string;
  onSelect: (option: T) => void;
  placeholder?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  getCurrentLabel?: () => string;
}

export const Select = <T extends SelectOption = SelectOption>({
  options,
  value,
  onSelect,
  placeholder = "Select an option",
  style,
  textStyle,
  disabled = false,
  getCurrentLabel,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const displayText = getCurrentLabel
    ? getCurrentLabel()
    : selectedOption?.label || placeholder;

  const handleSelect = (option: T) => {
    onSelect(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            textStyle,
            disabled && styles.selectTextDisabled,
          ]}
        >
          {displayText}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={disabled ? "#CCC" : "#666"}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.dropdown}>
              {options.map((option, index) => {
                const isSelected = option.value === value;

                return (
                  <TouchableOpacity
                    key={`${option.value}-${option.order || ""}-${index}`}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                      index === 0 && styles.optionFirst,
                      index === options.length - 1 && styles.optionLast,
                    ]}
                    onPress={() => handleSelect(option)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="white"
                          style={styles.checkmark}
                        />
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // No positioning needed anymore
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  selectText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  selectTextDisabled: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: Dimensions.get("window").width * 0.85,
    maxHeight: Dimensions.get("window").height * 0.6,
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  optionFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionSelected: {
    backgroundColor: "#DC3545",
  },
  optionLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkmark: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "500",
  },
});
