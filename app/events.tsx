import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getEvents, clearEvents, Event } from '../services/events';

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
  const [events, setEvents]     = useState<Event[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useFocusEffect(useCallback(() => { fetchEvents(); }, []));

  async function fetchEvents() { // fetches events from backend
    try {
      const resp = await getEvents();
      setEvents(resp.data.data);
    } catch {
      setError('Failed to load events');
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
        catch { setError('Failed to clear events'); }
      }}
    ]);
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Text style={styles.refreshBtn}>{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmClear} disabled={events.length === 0}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? <ActivityIndicator /> : (
        <FlatList // render flatlist of events with event type badge and timestamp, sorted by most recent
          data={events}
          keyExtractor={e => e.eventId.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor: EVENT_COLORS[item.eventType] ?? '#6b7280' }]}>
                <Text style={styles.badgeText}>{item.eventType}</Text>
                {/* only render key name if it exists */}
                {item.keyName && <Text style={styles.badgeSubtext}>{item.keyName}</Text>}
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No events recorded.</Text>}
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
  refreshBtn:    { color: '#2563eb' },
  clearBtn:      { color: 'red' },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  badge:         { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  badgeSubtext:  { color: '#ffffffcc', fontSize: 11, marginTop: 2 },
  date:          { color: '#666', fontSize: 12 },
  error:         { color: 'red' },
});