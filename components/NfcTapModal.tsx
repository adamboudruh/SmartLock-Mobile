import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible:    boolean;
  scanning:   boolean;
  scanned:    boolean;
  scanError:  string | null;
  tagUid:     string;
  name:       string;
  submitting: boolean;
  onClose:    () => void;
  onRetry:    () => void;
  onChangeName: (name: string) => void;
  onRegister: () => void;
};

export default function NfcTapModal({
  visible, scanning, scanned, scanError,
  tagUid, name, submitting,
  onClose, onRetry, onChangeName, onRegister,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Register via Tap</Text>

          {!scanned && (
            <View style={styles.nfcPrompt}>
              <Ionicons name="radio-outline" size={80} color={scanError ? 'red' : '#2563eb'} />
              <Text style={styles.nfcLabel}>
                {scanError ? scanError : scanning ? 'Waiting for tag...' : 'Tap your key fob to the back of your phone'}
              </Text>
              {scanError && (
                <TouchableOpacity style={styles.modalBtn} onPress={onRetry}>
                  <Text style={styles.modalBtnText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {scanned && (
            <View style={styles.scannedSection}>
              <Text style={styles.scannedLabel}>Scanned ID</Text>
              <Text style={styles.scannedUid}>{tagUid}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a name for this key"
                value={name}
                onChangeText={onChangeName}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.modalBtn, (!name || submitting) && styles.btnDisabled]}
                onPress={onRegister}
                disabled={!name || submitting}
              >
                <Text style={styles.modalBtnText}>{submitting ? 'Registering...' : 'Register'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal:          { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', gap: 12 },
  modalTitle:     { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalBtn:       { backgroundColor: '#2563eb', padding: 12, borderRadius: 6, alignItems: 'center' },
  modalBtnText:   { color: '#fff', fontWeight: '700' },
  btnDisabled:    { opacity: 0.4 },
  nfcPrompt:      { alignItems: 'center', paddingVertical: 24, gap: 16 },
  nfcLabel:       { textAlign: 'center', color: '#6b7280', fontSize: 14 },
  scannedSection: { gap: 10 },
  scannedLabel:   { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  scannedUid:     { fontFamily: 'monospace', fontSize: 13, color: '#111', marginBottom: 4 },
  input:          { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8 },
  cancelBtn:      { alignItems: 'center', marginTop: 4 },
  cancelText:     { color: '#6b7280' },
});