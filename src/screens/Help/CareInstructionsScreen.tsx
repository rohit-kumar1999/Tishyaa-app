import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CareInstructionsScreen() {
  const [activeTab, setActiveTab] = useState("gold");

  const tabs = [
    { id: "gold", label: "Gold", icon: "sunny-outline" },
    { id: "silver", label: "Silver", icon: "moon-outline" },
    { id: "diamonds", label: "Diamonds", icon: "diamond-outline" },
    { id: "pearls", label: "Pearls", icon: "ellipse-outline" },
  ];

  const goldCare = {
    dos: [
      "Store in a soft cloth pouch or lined jewelry box",
      "Clean regularly with mild soap and warm water",
      "Polish gently with a soft, lint-free cloth",
      "Remove before swimming or bathing",
      "Apply perfume and cosmetics before wearing jewelry",
    ],
    donts: [
      "Expose to harsh chemicals or chlorine",
      "Wear during heavy physical activities",
      "Store with other jewelry that may scratch",
      "Use abrasive cleaners or brushes",
      "Sleep wearing delicate pieces",
    ],
    cleaning:
      "Soak in warm water with a few drops of mild dish soap for 15-20 minutes. Gently brush with a soft toothbrush, rinse thoroughly, and pat dry with a soft cloth.",
  };

  const silverCare = {
    dos: [
      "Store in anti-tarnish bags or cloths",
      "Wear regularly - natural oils slow tarnishing",
      "Use silver polishing cloths for shine",
      "Keep in a cool, dry place",
      "Clean after each wear with a soft cloth",
    ],
    donts: [
      "Expose to rubber, latex, or wool",
      "Use in hot tubs or swimming pools",
      "Store in humid areas",
      "Use harsh chemicals for cleaning",
      "Leave in direct sunlight for extended periods",
    ],
    cleaning:
      "Use a specialized silver cleaning solution or make a paste with baking soda and water. Apply gently, rinse thoroughly with warm water, and dry immediately.",
  };

  const diamondCare = {
    dos: [
      "Clean monthly for maximum brilliance",
      "Store diamonds separately from other jewelry",
      "Have prongs checked annually by a professional",
      "Use an ultrasonic cleaner if available",
      "Handle by the band, not the stone",
    ],
    donts: [
      "Touch the diamond surface frequently",
      "Expose to extreme temperature changes",
      "Wear during rough activities",
      "Use chlorine or bleach near diamonds",
      "Store multiple pieces together",
    ],
    cleaning:
      "Soak in a solution of warm water and ammonia-free dish soap. Use a soft brush to clean around the setting. Rinse well and dry with a lint-free cloth.",
  };

  const pearlCare = {
    dos: [
      "Put pearls on last after makeup and perfume",
      "Wipe with a soft cloth after each wear",
      "Store flat in a silk or satin pouch",
      "Have strings restrung every 1-2 years",
      "Wear them often - pearls love skin contact",
    ],
    donts: [
      "Spray perfume or hairspray directly on pearls",
      "Store in plastic bags or airtight containers",
      "Expose to extreme heat or dryness",
      "Clean with chemicals or ultrasonic cleaners",
      "Let pearls come in contact with vinegar or citrus",
    ],
    cleaning:
      "Wipe gently with a damp, soft cloth after wearing. For deeper cleaning, use a cloth dampened with mild soapy water, then wipe with a clean damp cloth and let air dry.",
  };

  const getCareInfo = () => {
    switch (activeTab) {
      case "gold":
        return goldCare;
      case "silver":
        return silverCare;
      case "diamonds":
        return diamondCare;
      case "pearls":
        return pearlCare;
      default:
        return goldCare;
    }
  };

  const careInfo = getCareInfo();

  const generalTips = [
    {
      icon: "water-outline",
      title: "Avoid Water",
      description: "Remove jewelry before swimming, showering, or exercising.",
    },
    {
      icon: "flask-outline",
      title: "Chemicals",
      description: "Keep away from perfumes, lotions, and household chemicals.",
    },
    {
      icon: "archive-outline",
      title: "Proper Storage",
      description: "Store pieces separately to prevent scratches and tangling.",
    },
    {
      icon: "calendar-outline",
      title: "Regular Care",
      description: "Clean your jewelry regularly and inspect for damage.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/home")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Care Instructions</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Ionicons name="sparkles-outline" size={48} color="#C9A961" />
          <Text style={styles.introTitle}>Keep Your Jewelry Beautiful</Text>
          <Text style={styles.introText}>
            Proper care ensures your precious jewelry maintains its beauty and
            lasts for generations.
          </Text>
        </View>

        {/* General Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionHeader}>General Care Tips</Text>
          <View style={styles.tipsGrid}>
            {generalTips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Ionicons name={tip.icon as any} size={24} color="#C9A961" />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Material-Specific Care */}
        <Text style={[styles.sectionHeader, { marginHorizontal: 16 }]}>
          Care by Material
        </Text>

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

        {/* Do's and Don'ts */}
        <View style={styles.careContent}>
          <View style={styles.dosSection}>
            <View style={styles.dosDontsHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.dosDontsTitle}>Do's</Text>
            </View>
            {careInfo.dos.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark" size={16} color="#10B981" />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dontsSection}>
            <View style={styles.dosDontsHeader}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
              <Text style={styles.dosDontsTitle}>Don'ts</Text>
            </View>
            {careInfo.donts.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="close" size={16} color="#EF4444" />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cleaningSection}>
            <Text style={styles.cleaningTitle}>Cleaning Instructions</Text>
            <Text style={styles.cleaningText}>{careInfo.cleaning}</Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Professional Care</Text>
          <Text style={styles.contactText}>
            For deep cleaning, repairs, or restoration, visit our store or
            contact us to schedule a professional jewelry service.
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>care@tishyaajewels.com</Text>
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  tipsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  tipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  tipCard: {
    width: "46%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    margin: "2%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
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
  careContent: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dosSection: {
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
  dontsSection: {
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
  dosDontsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dosDontsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    lineHeight: 20,
  },
  cleaningSection: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cleaningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 8,
  },
  cleaningText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 22,
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
