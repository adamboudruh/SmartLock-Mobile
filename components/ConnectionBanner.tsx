import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/useTheme';

type Props = { connected: boolean };

export default function ConnectionBanner({ connected }: Props) {
    const { theme } = useTheme();
    if (connected) return null;

    return (
        <View style={[styles.banner, { backgroundColor: theme.error }]}>
            <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
            <Text style={styles.text}>Can&apos;t reach server, check your connection</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, marginBottom: 8 },
    text:   { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
});