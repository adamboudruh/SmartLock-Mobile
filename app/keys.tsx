import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getKeys, registerKey, deleteKey, Key } from '../services/keys';
import { scanNfcTag, isNfcSupported, isNfcEnabled } from '../services/nfcService';
import { hashUID } from '../utils/hashUid';
import NfcTapModal from '../components/NfcTapModal';
import ManualKeyModal from '../components/ManualKeyModal';

type ModalType = 'tap' | 'manual' | null;

export default function Keys() {
  const [keys, setKeys]             = useState<Key[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [modalType, setModalType]   = useState<ModalType>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName]             = useState('');
  const [tagUid, setTagUid]         = useState('');
  const [scanning, setScanning]     = useState(false);
  const [scanError, setScanError]   = useState<string | null>(null);
  const [scanned, setScanned]       = useState(false);

  useFocusEffect(useCallback(() => { fetchKeys(); }, []));

  async function fetchKeys() {
    try {
      const resp = await getKeys();
      setKeys(resp.data);
    } catch {
      setError('Failed to load keys');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
      console.log('[handleRegister] called, name:', name, 'tagUid:', tagUid);
    if (!name || !tagUid) return;
    setSubmitting(true); setError(null);
    const registeredName = name; // ← capture before any state changes
    try {
        const hashedUid = await hashUID(tagUid);
        console.log('[handleRegister] hashed uid:', hashedUid); // confirm hashing works
        await registerKey(registeredName, hashedUid);
        closeModal();
        await fetchKeys();
        setTimeout(() => {
        Alert.alert('Success', `Key "${registeredName}" registered successfully.`);
        }, 300); // ← wait for modal close animation before showing alert
    } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to register key');
    } finally {
        setSubmitting(false);
    }
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete Key', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteKey(id); await fetchKeys(); }
        catch { setError('Failed to delete key'); }
      }}
    ]);
  }

  function openModal(type: ModalType) {
    setName(''); setTagUid(''); setScanError(null); setScanned(false);
    setModalType(type);
    if (type === 'tap') startScan();
  }

  function closeModal() {
    setModalType(null); setScanning(false); setScanned(false);
    setScanError(null); setName(''); setTagUid('');
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
    <View style={styles.page}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn} onPress={() => openModal('tap')}>
          <Text>Register via Tap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => openModal('manual')}>
          <Text>Register Manually</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={keys}
          keyExtractor={k => k.keyId}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={{ flex: 1, fontWeight: 'bold' }}>{item.name}</Text>
              <TouchableOpacity onPress={() => confirmDelete(item.keyId)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text>No keys registered.</Text>}
        />
      )}

      <NfcTapModal
        visible={modalType === 'tap'}
        scanning={scanning}
        scanned={scanned}
        scanError={scanError}
        tagUid={tagUid}
        name={name}
        submitting={submitting}
        onClose={closeModal}
        onRetry={startScan}
        onChangeName={setName}
        onRegister={handleRegister}
      />

      <ManualKeyModal
        visible={modalType === 'manual'}
        name={name}
        tagUid={tagUid}
        submitting={submitting}
        onClose={closeModal}
        onChangeName={setName}
        onChangeTagUid={setTagUid}
        onRegister={handleRegister}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page:       { flex: 1, padding: 20, gap: 8 },
  buttonRow:  { flexDirection: 'row', gap: 12, marginBottom: 8 },
  btn:        { flex: 1, borderWidth: 1, borderColor: '#000', padding: 10, borderRadius: 6, alignItems: 'center' },
  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  deleteText: { color: 'red' },
  error:      { color: 'red' },
});