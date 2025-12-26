import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SizeGuideScreen() {
  const [activeTab, setActiveTab] = useState("rings");

  const tabs = [
    { id: "rings", label: "Rings", icon: "ellipse-outline" },
    { id: "bangles", label: "Bangles", icon: "radio-button-off-outline" },
    { id: "necklaces", label: "Necklaces", icon: "link-outline" },
    { id: "earrings", label: "Earrings", icon: "diamond-outline" },
  ];

  const ringSizes = [
    { us: "4", uk: "H", diameter: "14.9mm", circumference: "46.8mm" },
    { us: "5", uk: "J½", diameter: "15.7mm", circumference: "49.3mm" },
    { us: "6", uk: "L½", diameter: "16.5mm", circumference: "51.9mm" },
    { us: "7", uk: "N½", diameter: "17.3mm", circumference: "54.4mm" },
    { us: "8", uk: "P½", diameter: "18.1mm", circumference: "57.0mm" },
    { us: "9", uk: "R½", diameter: "19.0mm", circumference: "59.5mm" },
    { us: "10", uk: "T½", diameter: "19.8mm", circumference: "62.1mm" },
  ];

  const bangleSizes = [
    { size: "2-2", diameter: "52mm", circumference: "163mm", wrist: "Small" },
    { size: "2-4", diameter: "56mm", circumference: "176mm", wrist: "Medium" },
    { size: "2-6", diameter: "60mm", circumference: "188mm", wrist: "Large" },
    { size: "2-8", diameter: "64mm", circumference: "201mm", wrist: "XL" },
    { size: "2-10", diameter: "68mm", circumference: "213mm", wrist: "XXL" },
  ];

  const necklaceLengths = [
    {
      length: "14 inches",
      cm: "35.5cm",
      style: "Choker",
      fit: "Sits on the neck",
    },
    { length: "16 inches", cm: "40.6cm", style: "Collar", fit: "Base of neck" },
    {
      length: "18 inches",
      cm: "45.7cm",
      style: "Princess",
      fit: "Below collarbone",
    },
    { length: "20 inches", cm: "50.8cm", style: "Matinee", fit: "Above bust" },
    { length: "24 inches", cm: "61cm", style: "Opera", fit: "At bust level" },
    { length: "30 inches", cm: "76.2cm", style: "Rope", fit: "Below bust" },
  ];

  const earringStyles = [
    {
      style: "Studs",
      size: "6-10mm",
      description: "Perfect for everyday wear, sits on earlobe",
    },
    {
      style: "Hoops",
      size: "15-50mm",
      description: "Circular design, various diameters available",
    },
    {
      style: "Drops",
      size: "25-45mm",
      description: "Hangs below earlobe, elegant look",
    },
    {
      style: "Chandeliers",
      size: "50-75mm",
      description: "Statement pieces, dramatic effect",
    },
    {
      style: "Huggies",
      size: "10-15mm",
      description: "Small hoops that hug the earlobe",
    },
  ];

  const renderRingsGuide = () => (
    <View>
      <View style={styles.measureTip}>
        <Ionicons name="bulb-outline" size={24} color="#C9A961" />
        <Text style={styles.measureTipText}>
          Measure the inside diameter of a ring that fits well, or wrap a string
          around your finger and measure its length.
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.cellSmall]}>US</Text>
          <Text style={[styles.tableHeaderCell, styles.cellSmall]}>UK</Text>
          <Text style={[styles.tableHeaderCell, styles.cellMedium]}>
            Diameter
          </Text>
          <Text style={[styles.tableHeaderCell, styles.cellMedium]}>
            Circumference
          </Text>
        </View>
        {ringSizes.map((size, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
          >
            <Text style={[styles.tableCell, styles.cellSmall]}>{size.us}</Text>
            <Text style={[styles.tableCell, styles.cellSmall]}>{size.uk}</Text>
            <Text style={[styles.tableCell, styles.cellMedium]}>
              {size.diameter}
            </Text>
            <Text style={[styles.tableCell, styles.cellMedium]}>
              {size.circumference}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBanglesGuide = () => (
    <View>
      <View style={styles.measureTip}>
        <Ionicons name="bulb-outline" size={24} color="#C9A961" />
        <Text style={styles.measureTipText}>
          Bring your thumb and pinky together. Measure the widest part of your
          hand at the knuckles using a measuring tape.
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.cellSmall]}>Size</Text>
          <Text style={[styles.tableHeaderCell, styles.cellMedium]}>
            Diameter
          </Text>
          <Text style={[styles.tableHeaderCell, styles.cellMedium]}>
            Circumference
          </Text>
          <Text style={[styles.tableHeaderCell, styles.cellSmall]}>Fit</Text>
        </View>
        {bangleSizes.map((size, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
          >
            <Text style={[styles.tableCell, styles.cellSmall]}>
              {size.size}
            </Text>
            <Text style={[styles.tableCell, styles.cellMedium]}>
              {size.diameter}
            </Text>
            <Text style={[styles.tableCell, styles.cellMedium]}>
              {size.circumference}
            </Text>
            <Text style={[styles.tableCell, styles.cellSmall]}>
              {size.wrist}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderNecklacesGuide = () => (
    <View>
      <View style={styles.measureTip}>
        <Ionicons name="bulb-outline" size={24} color="#C9A961" />
        <Text style={styles.measureTipText}>
          Use a soft measuring tape around your neck. Add the desired drop
          length to find your perfect necklace length.
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.cellMedium]}>
            Length
          </Text>
          <Text style={[styles.tableHeaderCell, styles.cellSmall]}>CM</Text>
          <Text style={[styles.tableHeaderCell, styles.cellMedium]}>Style</Text>
        </View>
        {necklaceLengths.map((item, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
          >
            <Text style={[styles.tableCell, styles.cellMedium]}>
              {item.length}
            </Text>
            <Text style={[styles.tableCell, styles.cellSmall]}>{item.cm}</Text>
            <Text style={[styles.tableCell, styles.cellMedium]}>
              {item.style}
            </Text>
          </View>
        ))}
      </View>

      {necklaceLengths.map((item, index) => (
        <View key={index} style={styles.lengthCard}>
          <Text style={styles.lengthCardTitle}>{item.style}</Text>
          <Text style={styles.lengthCardFit}>{item.fit}</Text>
        </View>
      ))}
    </View>
  );

  const renderEarringsGuide = () => (
    <View>
      <View style={styles.measureTip}>
        <Ionicons name="bulb-outline" size={24} color="#C9A961" />
        <Text style={styles.measureTipText}>
          Consider your face shape and occasion when choosing earring styles.
          Longer earrings elongate the face, while studs are versatile for any
          look.
        </Text>
      </View>

      {earringStyles.map((item, index) => (
        <View key={index} style={styles.earringCard}>
          <View style={styles.earringHeader}>
            <Text style={styles.earringStyle}>{item.style}</Text>
            <Text style={styles.earringSize}>{item.size}</Text>
          </View>
          <Text style={styles.earringDescription}>{item.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "rings":
        return renderRingsGuide();
      case "bangles":
        return renderBanglesGuide();
      case "necklaces":
        return renderNecklacesGuide();
      case "earrings":
        return renderEarringsGuide();
      default:
        return renderRingsGuide();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/home")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Size Guide</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Ionicons name="resize-outline" size={48} color="#C9A961" />
          <Text style={styles.introTitle}>Find Your Perfect Fit</Text>
          <Text style={styles.introText}>
            Use our comprehensive size guides to find the perfect fit for rings,
            bangles, necklaces, and earrings.
          </Text>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? "white" : "#6B7280"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={styles.guideContent}>{renderContent()}</View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need Help Choosing?</Text>
          <Text style={styles.contactText}>
            Our jewelry experts can help you find the perfect size. Contact us
            for personalized assistance.
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>sizing@tishyaajewels.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>+91 9876543210</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  introSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  introText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabActive: {
    backgroundColor: "#C9A961",
    borderColor: "#C9A961",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 8,
  },
  tabLabelActive: {
    color: "white",
  },
  guideContent: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  measureTip: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  measureTipText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    marginLeft: 12,
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#C9A961",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRowAlt: {
    backgroundColor: "#F9FAFB",
  },
  tableCell: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  cellSmall: {
    flex: 1,
  },
  cellMedium: {
    flex: 1.5,
  },
  lengthCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lengthCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  lengthCardFit: {
    fontSize: 14,
    color: "#6B7280",
  },
  earringCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earringHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  earringStyle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  earringSize: {
    fontSize: 14,
    color: "#C9A961",
    fontWeight: "600",
  },
  earringDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 32,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
    lineHeight: 24,
  },
  contactInfo: {
    marginTop: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactValue: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
});
