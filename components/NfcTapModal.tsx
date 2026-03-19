import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/useTheme';
import ColorPicker from './ColorPicker';

type Props = {
    visible:       boolean;
    scanning:      boolean;
    scanned:       boolean;
    scanError:     string | null;
    tagUid:        string;
    name:          string;
    color:         string;
    submitting:    boolean;
    onClose:       () => void;
    onRetry:       () => void;
    onChangeName:  (name: string) => void;
    onChangeColor: (color: string) => void;
    onRegister:    () => void;
};

export default function NfcTapModal({
    visible, scanning, scanned, scanError,
    tagUid, name, color, submitting,
    onClose, onRetry, onChangeName, onChangeColor, onRegister,
}: Props) {
    const { theme } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
                <View style={[styles.modal, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Register via Tap</Text>

                    {!scanned && (
                        <View style={styles.nfcPrompt}>
                            <Ionicons name="radio-outline" size={80} color={scanError ? theme.error : theme.primary} />
                            <Text style={[styles.nfcLabel, { color: theme.textSecondary }]}>
                                {scanError
                                    ? scanError
                                    : scanning
                                        ? 'Hold your key fob against the back of your phone...'
                                        : 'Tap your key fob to the back of your phone'}
                            </Text>
                            {scanError && (
                                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={onRetry}>
                                    <Text style={styles.modalBtnText}>Try Again</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {scanned && (
                        <View style={styles.scannedSection}>
                            <Text style={[styles.scannedLabel, { color: theme.textSecondary }]}>Scanned ID</Text>
                            <Text style={[styles.scannedUid, { color: theme.text }]}>{tagUid}</Text>
                            <TextInput
                                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }]}
                                placeholder="Enter a name for this key"
                                placeholderTextColor={theme.placeholder}
                                value={name}
                                onChangeText={onChangeName}
                                autoFocus
                            />
                            <ColorPicker selected={color} onSelect={onChangeColor} />
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.primary }, (!name || submitting) && styles.btnDisabled]}
                                onPress={onRegister}
                                disabled={!name || submitting}
                            >
                                <Text style={styles.modalBtnText}>{submitting ? 'Registering...' : 'Register'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modal:          { borderRadius: 16, padding: 24, width: '85%', gap: 12 },
    modalTitle:     { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    modalBtn:       { padding: 12, borderRadius: 8, alignItems: 'center' },
    modalBtnText:   { color: '#fff', fontWeight: '700' },
    btnDisabled:    { opacity: 0.4 },
    nfcPrompt:      { alignItems: 'center', paddingVertical: 24, gap: 16 },
    nfcLabel:       { textAlign: 'center', fontSize: 14 },
    scannedSection: { gap: 10 },
    scannedLabel:   { fontSize: 12, fontWeight: '600' },
    scannedUid:     { fontFamily: 'monospace', fontSize: 13, marginBottom: 4 },
    input:          { borderWidth: 1, borderRadius: 8, padding: 10 },
    cancelBtn:      { alignItems: 'center', marginTop: 4 },
    cancelText:     {},
});