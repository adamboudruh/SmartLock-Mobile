import { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getState, lockDoor, unlockDoor, DeviceState } from '../services/devices';
import { wsService } from '@/services/wsService'; 

// displays current state of device (online/offline, locked/unlocked, door open/closed)
// actions on this screen: send lock/unlock commands to the device
export default function Dashboard() {
  const [state, setState]       = useState<DeviceState>({ isLocked: null, isAjar: null, online: false });
  const [loading, setLoading]   = useState(true);
  const [cmdLoading, setCmdLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    wsService.onUpdate((newState) => { setState(newState); }); // subscribe to state updates from wsService
    wsService.connect(); // establish connection when component mounts
    return () => { wsService.disconnect(); }; // clean up on unmount
  }, []);

  useFocusEffect(useCallback(() => { fetchState(); }, []));

  async function fetchState() {
    try {
      const resp = await getState();
      setState(resp.data);
    } catch {
      setError('failed to load state');
    } finally {
      setLoading(false);
    }
  }

  async function handleLock() {
    setCmdLoading(true); setError(null);
    try { await lockDoor(); }
    catch (e: any) { setError(e.response?.data?.error || 'Failed to lock'); }
    finally { setCmdLoading(false); }
  }

  async function handleUnlock() {
    setCmdLoading(true); setError(null);
    try { await unlockDoor(); }
    catch (e: any) { setError(e.response?.data?.error || 'Failed to unlock'); }
    finally { setCmdLoading(false); }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.page}>
      <Text>Connection: {state.online ? 'Online' : 'Offline'}</Text>
      <Text>Lock: {state.isLocked === null ? 'Unknown' : state.isLocked ? 'Locked' : 'Unlocked'}</Text>
      <Text>Door: {state.isAjar === null ? 'Unknown' : state.isAjar ? 'Ajar' : 'Closed'}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={handleLock} disabled={!state.online || cmdLoading}>
          <Text>Lock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleUnlock} disabled={!state.online || cmdLoading}>
          <Text>Unlock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page:     { flex: 1, padding: 20, gap: 8 },
  controls: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn:      { borderWidth: 1, borderColor: '#000', padding: 12, borderRadius: 8 },
  error:    { color: 'red' },
});