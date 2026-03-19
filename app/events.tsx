import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getEvents, clearEvents, Event } from '../services/events';
import { useTheme } from '../utils/useTheme';

// screen to display event log
// actions on this screen: clear all events, view event details (event type, key used, timestamp)
const EVENT_COLORS: Record<string, string> = {
  SuccessKeyUnlock: '#16a34a',
  FailKeyUnlock:    '#dc2626',
  RemoteLock:       '#eeb66e',
  RemoteUnlock:     '#af8dea',
  ButtonLock:       '#d97706',
  ButtonUnlock:     '#7324da',
  Open:             '#0891b2',
  Close:            '#6b7280',
};

export default function Events() {
  const { theme } = useTheme();
  const [events, setEvents]     = useState<Event[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { fetchEvents(); }, []));

  async function fetchEvents() { // fetches events from backend
    try {
      const resp = await getEvents();
      setEvents(resp.data);
    } catch {
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() { // tracks refreshing state to disable button and show loading text
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }

  function confirmClear() {
    Alert.alert('Clear Events', 'Clear all events?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        try { await clearEvents(); setEvents([]); } // call clear events api and clear state var
        catch { Alert.alert('Error', 'Failed to clear events'); }
      }}
    ]);
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Events</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Text style={[styles.refreshBtn, { color: theme.primary }]}>{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmClear} disabled={events.length === 0}>
            <Text style={[styles.clearBtn, { color: theme.destructive, opacity: events.length === 0 ? 0.5 : 1 }]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator color={theme.primary} /> : (
        <FlatList // render flatlist of events with event type badge and timestamp, sorted by most recent
          data={events}
          keyExtractor={e => e.eventId.toString()}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
              <View style={[styles.badge, { backgroundColor: EVENT_COLORS[item.eventType] ?? '#6b7280' }]}>
                <Text style={styles.badgeText}>{item.eventType}</Text>
                {/* only render key name if it exists */}
                {item.keyName && <Text style={styles.badgeSubtext}>{item.keyName}</Text>}
              </View>
              <Text style={[styles.date, { color: theme.textSecondary }]}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: theme.textSecondary }}>No events recorded.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page:          { flex: 1, padding: 20, gap: 8 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerButtons: { flexDirection: 'row', gap: 12 },
  title:         { fontSize: 20, fontWeight: 'bold' },
  refreshBtn:    { fontWeight: '600' },
  clearBtn:      { fontWeight: '600' },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  badge:         { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  badgeSubtext:  { color: '#ffffffcc', fontSize: 11, marginTop: 2 },
  date:          { fontSize: 12 },
});