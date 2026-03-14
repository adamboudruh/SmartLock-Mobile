import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

type Props = {
  visible:    boolean;
  name:       string;
  tagUid:     string;
  submitting: boolean;
  onClose:    () => void;
  onChangeName:   (val: string) => void;
  onChangeTagUid: (val: string) => void;
  onRegister: () => void;
};

export default function ManualKeyModal({
  visible, name, tagUid, submitting,
  onClose, onChangeName, onChangeTagUid, onRegister,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Register Manually</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={onChangeName}
          />
          <TextInput
            style={styles.input}
            placeholder="Tag UID"
            value={tagUid}
            onChangeText={onChangeTagUid}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.modalBtn, (!name || !tagUid || submitting) && styles.btnDisabled]}
            onPress={onRegister}
            disabled={!name || !tagUid || submitting}
          >
            <Text style={styles.modalBtnText}>{submitting ? 'Registering...' : 'Register'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal:        { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', gap: 12 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalBtn:     { backgroundColor: '#2563eb', padding: 12, borderRadius: 6, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '700' },
  btnDisabled:  { opacity: 0.4 },
  input:        { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8 },
  cancelBtn:    { alignItems: 'center', marginTop: 4 },
  cancelText:   { color: '#6b7280' },
});