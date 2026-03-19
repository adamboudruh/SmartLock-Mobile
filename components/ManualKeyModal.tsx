import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../utils/useTheme';
import ColorPicker from './ColorPicker';

type Props = {
    visible:        boolean;
    name:           string;
    tagUid:         string;
    color:          string;
    submitting:     boolean;
    onClose:        () => void;
    onChangeName:   (val: string) => void;
    onChangeTagUid: (val: string) => void;
    onChangeColor:  (val: string) => void;
    onRegister:     () => void;
};

export default function ManualKeyModal({
    visible, name, tagUid, color, submitting,
    onClose, onChangeName, onChangeTagUid, onChangeColor, onRegister,
}: Props) {
    const { theme } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
                <View style={[styles.modal, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Register Manually</Text>
                    <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }]}
                        placeholder="Name"
                        placeholderTextColor={theme.placeholder}
                        value={name}
                        onChangeText={onChangeName}
                    />
                    <TextInput
                        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }]}
                        placeholder="Tag UID"
                        placeholderTextColor={theme.placeholder}
                        value={tagUid}
                        onChangeText={onChangeTagUid}
                        autoCapitalize="characters"
                    />
                    <ColorPicker selected={color} onSelect={onChangeColor} />
                    <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: theme.primary }, (!name || !tagUid || submitting) && styles.btnDisabled]}
                        onPress={onRegister}
                        disabled={!name || !tagUid || submitting}
                    >
                        <Text style={styles.modalBtnText}>{submitting ? 'Registering...' : 'Register'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modal:        { borderRadius: 16, padding: 24, width: '85%', gap: 12 },
    modalTitle:   { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    modalBtn:     { padding: 12, borderRadius: 8, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: '700' },
    btnDisabled:  { opacity: 0.4 },
    input:        { borderWidth: 1, borderRadius: 8, padding: 10 },
    cancelBtn:    { alignItems: 'center', marginTop: 4 },
    cancelText:   {},
});