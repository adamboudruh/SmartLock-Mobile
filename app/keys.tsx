import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getKeys, registerKey, deleteKey, Key } from '../services/keys';
import { scanNfcTag, isNfcSupported, isNfcEnabled } from '../services/nfcService';
import { hashUID } from '../utils/hashUid';
import NfcTapModal from '../components/NfcTapModal';
import ManualKeyModal from '../components/ManualKeyModal';
import { useTheme } from '../utils/useTheme';

// screen to display list of registered keys
// allow registering new ones via NFC tap or manual entry, and deleting existing keys
type ModalType = 'tap' | 'manual' | null;

export default function Keys() {
  const { theme } = useTheme();
  const [keys, setKeys]             = useState<Key[]>([]); // array of registered keys
  const [loading, setLoading]       = useState(true);
  const [modalType, setModalType]   = useState<ModalType>(null); // which modal is open
  const [submitting, setSubmitting] = useState(false);
  const [name, setName]             = useState('');
  const [tagUid, setTagUid]         = useState('');
  const [color, setColor]           = useState('#3b82f6'); // default color for new keys
  const [scanning, setScanning]     = useState(false); // tracks if NFC scan is in progress
  const [scanError, setScanError]   = useState<string | null>(null); // stores any NFC scan errors
  const [scanned, setScanned]       = useState(false); // tracks if NFC tag has been successfully scanned to show text inputs

  useFocusEffect(useCallback(() => { fetchKeys(); }, []));

  async function fetchKeys() {
    try {
      const resp = await getKeys();
      setKeys(resp.data);
    } catch {
      Alert.alert('Error', 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!name || !tagUid) return;
    setSubmitting(true);
    const registeredName = name; // capture before any state changes
    try {
      const hashedUid = await hashUID(tagUid);
      await registerKey(registeredName, hashedUid, color);
      closeModal();
      await fetchKeys();
      setTimeout(() => {
        Alert.alert('Success', `Key "${registeredName}" registered successfully.`);
      }, 300); // wait for modal close animation before showing alert
    } catch (e: any) {
      Alert.alert('Register Failed', e.response?.data?.error || 'Failed to register key');
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete Key', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteKey(id); await fetchKeys(); }
        catch { Alert.alert('Error', 'Failed to delete key'); }
      }}
    ]);
  }

  function openModal(type: ModalType) {
    setName(''); setTagUid(''); setScanError(null); setScanned(false); setColor('#3b82f6');
    setModalType(type);
    if (type === 'tap') startScan();
  }

  function closeModal() {
    setModalType(null); setScanning(false); setScanned(false);
    setScanError(null); setName(''); setTagUid(''); setColor('#3b82f6');
  }

  async function startScan() {
    const supported = await isNfcSupported();
    if (!supported) { setScanError('This device does not support NFC.'); return; }
    const enabled = await isNfcEnabled();
    if (!enabled) { setScanError('NFC is disabled. Please enable it in your device settings.'); return; }
    setScanning(true); setScanError(null);
    try {
      const uid = await scanNfcTag();
      setTagUid(uid);
      setScanned(true);
    } catch (e: any) {
      setScanError(e.message || 'Scan failed. Try again.');
    } finally {
      setScanning(false);
    }
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.btn, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]} onPress={() => openModal('tap')}>
          <Text style={[styles.btnText, { color: theme.primary }]}>Register via Tap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { borderColor: theme.accent, backgroundColor: theme.accentLight }]} onPress={() => openModal('manual')}>
          <Text style={[styles.btnText, { color: theme.accent }]}>Register Manually</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={theme.primary} /> : (
        <FlatList
          data={keys}
          keyExtractor={k => k.keyId}
          refreshing={loading}
          onRefresh={fetchKeys}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.rowCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.swatch, { backgroundColor: item.color || '#3b82f6', borderColor: theme.border }]} />
              <Text style={[styles.keyName, { color: theme.text }]}>{item.name}</Text>
              <TouchableOpacity onPress={() => confirmDelete(item.keyId)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={theme.destructive} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: theme.textSecondary }}>No keys registered.</Text>}
        />
      )}

      <NfcTapModal
        visible={modalType === 'tap'}
        scanning={scanning}
        scanned={scanned}
        scanError={scanError}
        tagUid={tagUid}
        name={name}
        color={color}
        submitting={submitting}
        onClose={closeModal}
        onRetry={startScan}
        onChangeName={setName}
        onChangeColor={setColor}
        onRegister={handleRegister}
      />

      <ManualKeyModal
        visible={modalType === 'manual'}
        name={name}
        tagUid={tagUid}
        color={color}
        submitting={submitting}
        onClose={closeModal}
        onChangeName={setName}
        onChangeTagUid={setTagUid}
        onChangeColor={setColor}
        onRegister={handleRegister}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page:       { flex: 1, padding: 20, gap: 8 },
  buttonRow:  { flexDirection: 'row', gap: 12, marginBottom: 10 },
  btn:        { flex: 1, borderWidth: 1.5, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText:    { fontWeight: '700' },
  rowCard:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, marginBottom: 10, borderRadius: 12, borderWidth: 1 },
  swatch:     { width: 20, height: 20, borderRadius: 6, marginRight: 10, borderWidth: 1 },
  keyName:    { flex: 1, fontWeight: '700', fontSize: 15 },
  iconBtn:    { padding: 6 },
});