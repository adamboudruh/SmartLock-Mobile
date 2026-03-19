import { useState, useCallback } from 'react';
import {
    View, Text, Switch, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getSettings, updateSettings } from '../services/devices';
import { useTheme } from '../utils/useTheme';

const SETTING_IDS = {
    AUTO_LOCK_ENABLED: 1,
    AUTO_LOCK_DELAY_SEC: 2,
    DOOR_BUZZ_ENABLED: 3,
    DOOR_BUZZ_DELAY_SEC: 4,
    OPEN_CLOSE_TONE_ID: 5,
};

const TONE_OPTIONS = [
    { id: 0, name: 'Silent' },
    { id: 1, name: 'Happy' },
    { id: 2, name: 'Sad' },
    { id: 3, name: 'Mario Coin' },
    { id: 4, name: 'Dumpster Baby' },
    { id: 5, name: 'Lucy in the Sky' },
    { id: 6, name: 'Be Nice 2 Me' },
    { id: 7, name: 'Here Comes The Sun' },
];

export default function Settings() {
    const { theme, mode, setMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const [autoLockEnabled, setAutoLockEnabled] = useState(true);
    const [autoLockDelay, setAutoLockDelay] = useState('30');
    const [doorBuzzEnabled, setDoorBuzzEnabled] = useState(true);
    const [doorBuzzDelay, setDoorBuzzDelay] = useState('60');
    const [toneId, setToneId] = useState(1);

    useFocusEffect(useCallback(() => { fetchSettings(); }, []));

    async function fetchSettings() {
        try {
            setLoading(true);
            const resp = await getSettings();
            for (const s of resp.data) {
                switch (s.settingId) { // update state vars based on setting IDs returned from server
                    case SETTING_IDS.AUTO_LOCK_ENABLED: setAutoLockEnabled(s.value === '1'); break;
                    case SETTING_IDS.AUTO_LOCK_DELAY_SEC: setAutoLockDelay(s.value); break;
                    case SETTING_IDS.DOOR_BUZZ_ENABLED: setDoorBuzzEnabled(s.value === '1'); break;
                    case SETTING_IDS.DOOR_BUZZ_DELAY_SEC: setDoorBuzzDelay(s.value); break;
                    case SETTING_IDS.OPEN_CLOSE_TONE_ID: setToneId(parseInt(s.value) || 1); break;
                }
            }
            setDirty(false);
        } catch {
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await updateSettings([
                { settingId: SETTING_IDS.AUTO_LOCK_ENABLED, value: autoLockEnabled ? '1' : '0' }, // bools sent as 0 or 1 strings
                { settingId: SETTING_IDS.AUTO_LOCK_DELAY_SEC, value: autoLockDelay },
                { settingId: SETTING_IDS.DOOR_BUZZ_ENABLED, value: doorBuzzEnabled ? '1' : '0' },
                { settingId: SETTING_IDS.DOOR_BUZZ_DELAY_SEC, value: doorBuzzDelay },
                { settingId: SETTING_IDS.OPEN_CLOSE_TONE_ID, value: String(toneId) },
            ]);
            setDirty(false);
            Alert.alert('Saved', 'Settings synced to device.');
        } catch (e: any) {
            Alert.alert('Save Failed', e.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    }

    const set = (fn: Function) => (v: any) => { fn(v); setDirty(true); };

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={theme.primary} />;

    return (
        <ScrollView
            style={[s.page, { backgroundColor: theme.background }]}
            contentContainerStyle={{ paddingBottom: 60 }}
        >
            <Text style={[s.sectionTitle, { color: theme.text }]}>Device Settings</Text>

            <Text style={[s.heading, { color: theme.text }]}>Auto-Lock</Text>
            <View style={[s.row, { borderBottomColor: theme.border }]}>
                <Text style={{ color: theme.text }}>Enabled</Text>
                <Switch value={autoLockEnabled} onValueChange={set(setAutoLockEnabled)} />
            </View>
            {autoLockEnabled && (
                <View style={[s.row, { borderBottomColor: theme.border }]}>
                    <Text style={{ color: theme.text }}>Delay (seconds)</Text>
                    <TextInput
                        style={[s.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }]}
                        value={autoLockDelay}
                        onChangeText={(v) => { setAutoLockDelay(v.replace(/[^0-9]/g, '')); setDirty(true); }}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>
            )}

            <Text style={[s.heading, { color: theme.text }]}>Door Open Warning</Text>
            <View style={[s.row, { borderBottomColor: theme.border }]}>
                <Text style={{ color: theme.text }}>Enabled</Text>
                <Switch value={doorBuzzEnabled} onValueChange={set(setDoorBuzzEnabled)} />
            </View>
            {doorBuzzEnabled && (
                <View style={[s.row, { borderBottomColor: theme.border }]}>
                    <Text style={{ color: theme.text }}>Delay (seconds)</Text>
                    <TextInput
                        style={[s.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }]}
                        value={doorBuzzDelay}
                        onChangeText={(v) => { setDoorBuzzDelay(v.replace(/[^0-9]/g, '')); setDirty(true); }}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>
            )}

            <Text style={[s.heading, { color: theme.text }]}>Unlock Tone</Text>
            <View style={s.toneGrid}>
                {TONE_OPTIONS.map((t) => (
                    <TouchableOpacity
                        key={t.id}
                        style={[
                            s.toneBtn,
                            { borderColor: theme.border, backgroundColor: theme.surface },
                            toneId === t.id && { borderColor: theme.primary, backgroundColor: theme.primaryLight },
                        ]}
                        onPress={() => { setToneId(t.id); setDirty(true); }}
                    >
                        <Text style={[{ color: theme.text }, toneId === t.id && { color: theme.primary, fontWeight: '600' }]}>{t.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: theme.primary }, !dirty && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!dirty || saving}
            >
                <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Settings'}</Text>
            </TouchableOpacity>

            <Text style={[s.sectionTitle, { color: theme.text, marginTop: 26 }]}>Display Settings</Text>
            <View style={[s.row, { borderBottomColor: theme.border }]}>
                <Text style={{ color: theme.text }}>Dark Mode</Text>
                <Switch
                    value={mode === 'dark'}
                    onValueChange={(enabled) => setMode(enabled ? 'dark' : 'light')}
                />
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    page:        { flex: 1, padding: 20 },
    sectionTitle:{ fontSize: 18, fontWeight: '700', marginBottom: 8 },
    heading:     { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
    input:       { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, width: 70, textAlign: 'center' },
    toneGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    toneBtn:     { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
    saveBtn:     { borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});