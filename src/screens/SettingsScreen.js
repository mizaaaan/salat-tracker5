import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Switch, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from '../utils/storage';
import { cancelAllNotifications } from '../utils/notifications';

export default function SettingsScreen() {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  const [notificationsEnabled, setNotifState] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    getNotificationsEnabled().then((val) => {
      setNotifState(val);
      setLoading(false);
    });
  }, []);

  const handleNotifToggle = async (value) => {
    setNotifState(value);
    await setNotificationsEnabled(value);

    if (!value) {
      // Cancel all pending notifications immediately
      await cancelAllNotifications();
    }
    // Enabling: notifications will be rescheduled next time Prayer Times loads
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={[styles.settingItem, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
          <View style={styles.settingTextWrap}>
            <Text style={[styles.label, { color: Colors.text }]}>Prayer Notifications</Text>
            <Text style={[styles.hint, { color: Colors.textSecondary }]}>
              {notificationsEnabled
                ? 'You will be notified at each prayer time'
                : 'Notifications are off — re-enable and visit Prayer Times to reschedule'}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotifToggle}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={notificationsEnabled ? Colors.primaryLight : Colors.textSecondary}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={[styles.settingItem, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
          <Text style={[styles.label, { color: Colors.text }]}>Calculation Method</Text>
          <Text style={[styles.value, { color: Colors.textSecondary }]}>Karachi</Text>
        </View>
        <View style={[styles.settingItem, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
          <Text style={[styles.label, { color: Colors.text }]}>App Version</Text>
          <Text style={[styles.value, { color: Colors.textSecondary }]}>1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  value: {
    fontSize: 14,
  },
});
