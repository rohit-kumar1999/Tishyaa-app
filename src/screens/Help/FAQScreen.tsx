import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FAQScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const faqCategories = [
    {
      title: "Ordering & Payment",
      icon: "card",
      questions: [
        {
          id: "order-1",
          question: "How do I place an order?",
          answer:
            "Simply browse our collection, add items to your cart, and proceed to checkout. You can create an account or checkout as a guest. We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets.",
        },
        {
          id: "order-2",
          question: "What payment methods do you accept?",
          answer:
            "We accept Visa, Mastercard, American Express, RuPay cards, UPI (Google Pay, PhonePe, Paytm), net banking, and popular digital wallets. All payments are secured with 256-bit SSL encryption.",
        },
        {
          id: "order-3",
          question: "Can I modify or cancel my order?",
          answer:
            "You can modify or cancel your order within 2 hours of placing it. After that, orders enter processing and cannot be changed. Contact our customer service team for assistance.",
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      questions: [
        {
          id: "ship-1",
          question: "How long does shipping take?",
          answer:
            "Standard shipping takes 3-7 business days. Express shipping (1-3 days) is available in select cities. International shipping takes 7-14 business days.",
        },
        {
          id: "ship-2",
          question: "Do you offer free shipping?",
          answer:
            "Yes! We offer free standard shipping on orders above ₹2,000. Express shipping charges apply separately.",
        },
        {
          id: "ship-3",
          question: "Can I track my order?",
          answer:
            "Yes, you'll receive a tracking number via email and SMS once your order ships. You can track your order in the app or website.",
        },
        {
          id: "ship-4",
          question: "Do you ship internationally?",
          answer:
            "Yes, we ship to over 50+ countries worldwide. International shipping rates and delivery times vary by location.",
        },
        {
          id: "ship-5",
          question: "What if I'm not available for delivery?",
          answer:
            "Our delivery partners will attempt delivery 3 times. You can also reschedule delivery or choose a pickup point during checkout.",
        },
      ],
    },
    {
      title: "Products & Quality",
      icon: "diamond-outline",
      color: "#06b6d4",
      questions: [
        {
          id: "ship-1",
          question: "How long does delivery take?",
          answer:
            "Standard delivery takes 3-7 business days within India. Express delivery is available in major cities within 1-2 days. International shipping takes 7-14 business days.",
        },
        {
          id: "ship-2",
          question: "Do you offer free shipping?",
          answer:
            "Yes! We offer free shipping on orders above ₹499 within India. For orders below ₹499, a shipping charge of ₹30 applies.",
        },
        {
          id: "ship-3",
          question: "How can I track my order?",
          answer:
            "You'll receive a tracking number via SMS and email once your order is dispatched. You can also track your order in the 'My Orders' section of your account.",
        },
      ],
    },
    {
      title: "Returns & Exchanges",
      icon: "repeat",
      questions: [
        {
          id: "return-1",
          question: "What is your return policy?",
          answer:
            "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Custom/personalized jewelry cannot be returned unless defective.",
        },
        {
          id: "return-2",
          question: "How do I initiate a return?",
          answer:
            "Go to 'My Orders', select the item you want to return, and click 'Return Item'. Our team will guide you through the process and arrange pickup.",
        },
        {
          id: "return-3",
          question: "When will I receive my refund?",
          answer:
            "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.",
        },
      ],
    },
    {
      title: "Product Care",
      icon: "shield-checkmark",
      questions: [
        {
          id: "care-1",
          question: "How should I care for my jewelry?",
          answer:
            "Store jewelry in a dry place, clean with a soft cloth, avoid contact with perfumes and chemicals, and remove before swimming or exercising. Each product comes with specific care instructions.",
        },
        {
          id: "care-2",
          question: "Do you provide certificates for gold/diamond jewelry?",
          answer:
            "Yes, all gold jewelry comes with BIS hallmark certification, and diamonds above 0.30 carats come with international grading certificates from GIA or IGI.",
        },
      ],
    },
  ];

  const filteredCategories = searchText
    ? faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(searchText.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchText.toLowerCase())
          ),
        }))
        .filter((category) => category.questions.length > 0)
    : faqCategories;

  const renderQuestion = (question: any, categoryIndex: number) => {
    const isOpen = openItems.includes(question.id);

    return (
      <View key={question.id} style={styles.questionContainer}>
        <TouchableOpacity
          style={styles.questionHeader}
          onPress={() => toggleItem(question.id)}
        >
          <Text style={styles.questionText}>{question.question}</Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#C9A961"
          />
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{question.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategory = (category: any, index: number) => (
    <View key={category.title} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Ionicons name={category.icon as any} size={24} color="#C9A961" />
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
      <View style={styles.questionsContainer}>
        {category.questions.map((question: any) =>
          renderQuestion(question, index)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Frequently Asked Questions</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQs..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>How can we help you?</Text>
          <Text style={styles.introText}>
            Find answers to common questions about our jewelry, orders,
            shipping, and more.
          </Text>
        </View>

        {filteredCategories.length > 0 ? (
          filteredCategories.map(renderCategory)
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={64} color="#E5E7EB" />
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsText}>
              Try different keywords or browse categories above
            </Text>
          </View>
        )}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Our customer service team is here to assist you
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble" size={20} color="#C9A961" />
              <Text style={styles.contactButtonText}>Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="mail" size={20} color="#C9A961" />
              <Text style={styles.contactButtonText}>Email Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="call" size={20} color="#C9A961" />
              <Text style={styles.contactButtonText}>Call Us</Text>
            </TouchableOpacity>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  content: {
    flex: 1,
  },
  introSection: {
    padding: 16,
    alignItems: "center",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  introText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  categoryContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 12,
  },
  questionsContainer: {
    padding: 16,
  },
  questionContainer: {
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  answerText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 64,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  contactSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF7E6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.3,
    justifyContent: "center",
  },
  contactButtonText: {
    color: "#C9A961",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});
