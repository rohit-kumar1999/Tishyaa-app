import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminMessagesScreen() {
  const messages = [
    { id: '1', name: 'John Doe', message: 'Query about product availability', time: '2 hours ago', unread: true },
    { id: '2', name: 'Jane Smith', message: 'Issue with recent order', time: '5 hours ago', unread: false },
    { id: '3', name: 'Mike Johnson', message: 'Requesting custom jewelry', time: '1 day ago', unread: true },
  ];

  const renderMessage = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.messageCard, item.unread && styles.unreadCard]}>
      <View style={styles.messageHeader}>
        <Text style={[styles.customerName, item.unread && styles.unreadText]}>{item.name}</Text>
        <Text style={styles.messageTime}>{item.time}</Text>
        {item.unread && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
      <View style={styles.messageActions}>
        <TouchableOpacity style={styles.replyButton}>
          <Ionicons name="chatbubble" size={16} color="#C9A961" />
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Messages</Text>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>2</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  unreadBadge: { backgroundColor: '#EF4444', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  unreadCount: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  listContainer: { padding: 16 },
  messageCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: '#C9A961' },
  messageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1 },
  unreadText: { fontWeight: 'bold' },
  messageTime: { fontSize: 12, color: '#6B7280', marginRight: 8 },
  unreadDot: { width: 8, height: 8, backgroundColor: '#C9A961', borderRadius: 4 },
  messageText: { fontSize: 14, color: '#374151', marginBottom: 12 },
  messageActions: { alignItems: 'flex-end' },
  replyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF7E6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  replyText: { color: '#C9A961', fontSize: 12, fontWeight: '600', marginLeft: 4 },
});