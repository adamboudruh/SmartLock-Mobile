import { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getState, lockDoor, unlockDoor, DeviceState } from '../services/devices';
import { wsService } from '@/services/wsService';
import { useTheme } from '../utils/useTheme';
import ConnectionBanner from '@/components/ConnectionBanner';

export default function Dashboard() {
    const { theme } = useTheme();
    const [state, setState] = useState<DeviceState>({ isLocked: null, isAjar: null, online: false }); // track state, updated via websocket
    const [loading, setLoading] = useState(true); // tracks if initial state is loading to show spinner
    const [cmdLoading, setCmdLoading] = useState(false); // tracks if command is being sent
    const [serverReachable, setServerReachable] = useState(false);

    useEffect(() => {
        wsService.onUpdate((newState) => { setState(newState); });
        wsService.onConnection((connected) => { setServerReachable(connected); });
        wsService.connect();
        return () => { wsService.disconnect(); };
    }, []);

    useFocusEffect(useCallback(() => { fetchState(); }, []));

    async function fetchState() {
        try {
            const resp = await getState();
            setState(resp.data);
        } catch {
            // don't alert if load failure, banner should handle that
        } finally {
            setLoading(false);
        }
    }

    async function handleLock() {
        setCmdLoading(true);
        try {
            await Promise.race([ // Promise.race is used to implement a timeout for the lock command
                lockDoor(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 5000)),
            ]);
        } catch (e: any) {
            Alert.alert('Lock Failed', e.response?.data?.error || e.message || 'Failed to lock');
        } finally {
            setCmdLoading(false);
        }
    }

    async function handleUnlock() {
        setCmdLoading(true);
        try {
            await Promise.race([ // Promise.race is used to implement a timeout for the unlock command
                unlockDoor(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 5000)),
            ]);
        } catch (e: any) {
            Alert.alert('Unlock Failed', e.response?.data?.error || e.message || 'Failed to unlock');
        } finally {
            setCmdLoading(false);
        }
    }

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={theme.primary} />;

    return (
        <View style={[styles.page, { backgroundColor: theme.background }]}>
            <ConnectionBanner connected={serverReachable} />

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Device Status</Text>

                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Connection</Text>
                    <View style={[styles.badge, { backgroundColor: state.online ? theme.success : theme.error }]}>
                        <Text style={styles.badgeText}>{state.online ? 'Online' : 'Offline'}</Text>
                    </View>
                </View>

                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Lock</Text>
                    <View style={[styles.badge, { backgroundColor: state.isLocked === null ? theme.warning : state.isLocked ? theme.primary : theme.accent }]}>
                        <Text style={styles.badgeText}>
                            {state.isLocked === null ? 'Unknown' : state.isLocked ? 'Locked' : 'Unlocked'}
                        </Text>
                    </View>
                </View>

                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Door</Text>
                    <View style={[styles.badge, { backgroundColor: state.isAjar === null ? theme.warning : state.isAjar ? theme.accent : theme.success }]}>
                        <Text style={styles.badgeText}>
                            {state.isAjar === null ? 'Unknown' : state.isAjar ? 'Ajar' : 'Closed'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.primary }, (!serverReachable || !state.online || cmdLoading) && styles.btnDisabled]}
                    onPress={handleLock}
                    disabled={!serverReachable || !state.online || cmdLoading}
                >
                    <Text style={styles.actionBtnText}>{cmdLoading ? 'Working...' : 'Lock'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.accent }, (!serverReachable || !state.online || cmdLoading) && styles.btnDisabled]}
                    onPress={handleUnlock}
                    disabled={!serverReachable || !state.online || cmdLoading}
                >
                    <Text style={styles.actionBtnText}>{cmdLoading ? 'Working...' : 'Unlock'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page:          { flex: 1, padding: 20, gap: 14 },
    card:          { borderRadius: 14, padding: 16, borderWidth: 1 },
    cardTitle:     { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    statusRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    statusLabel:   { fontSize: 14, fontWeight: '600' },
    badge:         { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText:     { color: '#fff', fontWeight: '700', fontSize: 12 },
    controls:      { flexDirection: 'row', gap: 12, marginTop: 4 },
    actionBtn:     { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    btnDisabled:   { opacity: 0.5 },
});