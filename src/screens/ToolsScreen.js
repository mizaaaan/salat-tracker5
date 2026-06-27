/**
 * ToolsScreen — unified Tools, Streak, and Settings in one scrollable page.
 *
 * BUG FIXES:
 *   Bug 1 — Settings card added inline (was unreachable separate screen)
 *   Bug 4 — Today's prayer pills now use getCompletedPrayers() for per-prayer state
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../constants/ThemeContext';
import {
  getStreakData, getWeeklyData,
  getCompletedPrayers,
  getNotificationsEnabled, setNotificationsEnabled,
} from '../utils/storage';
import { cancelAllNotifications } from '../utils/notifications';
import { TRACKABLE_PRAYERS } from '../utils/prayerTimes';

// ── Quotes ────────────────────────────────────────────────────────────────────
const QUOTES = [
  {
    text: 'Indeed, prayer has been decreed upon the believers a decree of specified times.',
    ref:  'Quran 4:103',
  },
  {
    text: 'The first matter that the servant will be brought to account for on the Day of Judgement is the prayer.',
    ref:  'Tirmidhi',
  },
  {
    text: 'Guard strictly the prayers, and the middle prayer, and stand before Allah devoutly obedient.',
    ref:  'Quran 2:238',
  },
];

const getStreakMessage = (n) => {
  if (n === 0) return 'Start your journey today 🌱';
  if (n < 3)   return 'Great start! Keep going! 💪';
  if (n < 7)   return "Masha Allah! You're consistent! ✨";
  if (n < 14)  return 'SubhanAllah! One week+ streak! 🌟';
  if (n < 30)  return 'Incredible consistency! ⭐⭐';
  return 'Allahu Akbar! You are truly dedicated! 👑';
};

// ── Shared sub-components ─────────────────────────────────────────────────────

/** Titled card shell shared by every section */
function SectionCard({ icon, title, children, styles }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderIcon}>{icon}</Text>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/** Thin horizontal rule inside a card */
const HR = ({ styles }) => <View style={styles.hr} />;

/** Single stat chip in the streak stats row */
const StatChip = ({ value, label, icon, styles }) => (
  <View style={styles.statChip}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/** One day column in the weekly view */
const DayCell = ({ dayName, completed, allDone, styles, Colors }) => (
  <View style={styles.dayCol}>
    <Text style={styles.dayName}>{dayName}</Text>
    <View style={[styles.dayCircle, allDone && styles.dayCircleDone]}>
      {allDone ? (
        <Text style={styles.dayCheck}>✓</Text>
      ) : (
        <Text style={[styles.dayCount, completed > 0 && { color: Colors.primary }]}>
          {completed}
        </Text>
      )}
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ToolsScreen() {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  // ── Streak state ──
  const [streak,       setStreak]       = useState({ currentStreak: 0, longestStreak: 0, totalDays: 0 });
  const [weekly,       setWeekly]       = useState([]);
  const [todayPrayers, setTodayPrayers] = useState([]);  // array of completed prayer names
  // ── Settings state ──
  const [notifEnabled, setNotifEnabled] = useState(true);
  // ── Loading ──
  const [loading, setLoading] = useState(true);
  // ── Quote (fixed for the session) ──
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // ── Load everything when tab gains focus ────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const todayKey = new Date().toISOString().split('T')[0];
    const [s, w, todayDone, notif] = await Promise.all([
      getStreakData(),
      getWeeklyData(),
      getCompletedPrayers(todayKey),   // BUG 4 FIX: individual prayer names, not just count
      getNotificationsEnabled(),
    ]);
    setStreak(s);
    setWeekly(w);
    setTodayPrayers(todayDone);
    setNotifEnabled(notif);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // ── Notification toggle ───────────────────────────────────────────────────
  const handleNotifToggle = async (value) => {
    setNotifEnabled(value);
    await setNotificationsEnabled(value);
    if (!value) await cancelAllNotifications();
  };

  const todayDoneCount = TRACKABLE_PRAYERS.filter(p => todayPrayers.includes(p)).length;

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Page heading ─────────────────────────────────────────────── */}
        <Text style={styles.pageTitle}>Tools & Stats</Text>

        {/* ════════════════════════════════════════════════════════════════
            STREAK CARD
        ════════════════════════════════════════════════════════════════ */}
        <SectionCard icon="🔥" title="Prayer Streak" styles={styles}>

          {/* Hero — big streak number */}
          <View style={styles.streakHero}>
            <Text style={styles.bigNumber}>{streak.currentStreak}</Text>
            <Text style={styles.dayLabel}>
              {streak.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
            </Text>
            <Text style={styles.streakMsg}>{getStreakMessage(streak.currentStreak)}</Text>
            {streak.currentStreak > 0 && (
              <View style={styles.flameRow}>
                {Array.from({ length: Math.min(streak.currentStreak, 7) }).map((_, i) => (
                  <Text key={i} style={styles.flame}>🔥</Text>
                ))}
              </View>
            )}
          </View>

          {/* Stat chips */}
          <View style={styles.statsRow}>
            <StatChip value={streak.longestStreak} label="Best Streak"  icon="🏆" styles={styles} />
            <StatChip value={streak.totalDays}     label="Total Days"   icon="📅" styles={styles} />
            <StatChip value={streak.totalDays * 5} label="Prayers Done" icon="🤲" styles={styles} />
          </View>

          <HR styles={styles} />

          {/* Weekly bead row */}
          <Text style={styles.subLabel}>This Week</Text>
          <View style={styles.weekRow}>
            {weekly.map((d, i) => (
              <DayCell
                key={i}
                dayName={d.dayName}
                completed={d.completed}
                allDone={d.allDone}
                styles={styles}
                Colors={Colors}
              />
            ))}
          </View>

          <HR styles={styles} />

          {/* Today's prayers — BUG 4 FIX: individual per-prayer highlight */}
          <Text style={styles.subLabel}>Today — {todayDoneCount}/5 done</Text>
          <View style={styles.pillsRow}>
            {TRACKABLE_PRAYERS.map((p) => {
              const done = todayPrayers.includes(p);
              return (
                <View key={p} style={[styles.pill, done && styles.pillDone]}>
                  <Text style={[styles.pillText, done && styles.pillTextDone]}>{p}</Text>
                  {done && <Text style={styles.pillCheck}>✓</Text>}
                </View>
              );
            })}
          </View>

          <HR styles={styles} />

          {/* Hadith quote */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteIcon}>📖</Text>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteRef}>— {quote.ref}</Text>
          </View>

        </SectionCard>

        {/* ════════════════════════════════════════════════════════════════
            MORE TOOLS (coming soon)
        ════════════════════════════════════════════════════════════════ */}
        <SectionCard icon="🧰" title="More Tools" styles={styles}>
          {[
            { icon: '📿', title: 'Tasbih Counter',     sub: 'Coming soon' },
            { icon: '🗓️', title: 'Islamic Calendar',   sub: 'Coming soon' },
            { icon: '🕋', title: 'Hajj & Umrah Guide', sub: 'Coming soon' },
          ].map(({ icon, title, sub }, idx, arr) => (
            <React.Fragment key={title}>
              <View style={styles.toolRow}>
                <View style={styles.toolIconBox}>
                  <Text style={styles.toolIcon}>{icon}</Text>
                </View>
                <View style={styles.toolMeta}>
                  <Text style={styles.toolTitle}>{title}</Text>
                  <Text style={styles.toolSub}>{sub}</Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              </View>
              {idx < arr.length - 1 && <HR styles={styles} />}
            </React.Fragment>
          ))}
        </SectionCard>

        {/* ════════════════════════════════════════════════════════════════
            SETTINGS CARD  — BUG 1 FIX: was a separate unreachable screen
        ════════════════════════════════════════════════════════════════ */}
        <SectionCard icon="⚙️" title="Settings" styles={styles}>

          {/* Notification toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingLabel}>Prayer Notifications</Text>
              <Text style={styles.settingHint}>
                {notifEnabled
                  ? 'You will be notified at each prayer time'
                  : 'Notifications off — visit Prayer Times to reschedule'}
              </Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleNotifToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={notifEnabled ? Colors.primaryLight : Colors.textSecondary}
            />
          </View>

          <HR styles={styles} />

          {/* Static info rows */}
          {[
            { label: 'Calculation Method', value: 'Karachi' },
            { label: 'App Version',        value: '1.0.0'   },
          ].map(({ label, value }, idx, arr) => (
            <React.Fragment key={label}>
              <View style={styles.infoRow}>
                <Text style={styles.settingLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
              {idx < arr.length - 1 && <HR styles={styles} />}
            </React.Fragment>
          ))}

        </SectionCard>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const getStyles = (Colors) => StyleSheet.create({

  container: { flex: 1, backgroundColor: Colors.background },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:    { paddingHorizontal: 16, paddingTop: 8 },

  // Page title
  pageTitle: {
    fontSize:    22,
    fontWeight:  '700',
    color:       Colors.text,
    textAlign:   'center',
    marginTop:   12,
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  // ── Section card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.card,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom:    14,
  },
  cardHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginBottom:   14,
  },
  cardHeaderIcon: {
    fontSize: 18,
  },
  cardHeaderTitle: {
    fontSize:   16,
    fontWeight: '700',
    color:      Colors.text,
    letterSpacing: 0.2,
  },

  // Divider
  hr: {
    height:          1,
    backgroundColor: Colors.divider,
    marginVertical:  14,
  },

  // ── Streak hero ───────────────────────────────────────────────────────────
  streakHero: {
    alignItems:    'center',
    paddingVertical: 8,
    marginBottom:  14,
  },
  bigNumber: {
    fontSize:   72,
    fontWeight: '900',
    color:      Colors.primary,
    lineHeight: 80,
  },
  dayLabel: {
    fontSize:   17,
    fontWeight: '600',
    color:      Colors.text,
    marginTop:  2,
  },
  streakMsg: {
    fontSize:  12,
    color:     Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  flameRow: {
    flexDirection: 'row',
    marginTop:     12,
    gap:           4,
  },
  flame: { fontSize: 20 },

  // ── Stat chips ────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap:           8,
    marginBottom:  2,
  },
  statChip: {
    flex:            1,
    backgroundColor: Colors.cardLight,
    borderRadius:    14,
    paddingVertical: 12,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  statIcon:  { fontSize: 18, marginBottom: 5 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: {
    fontSize:      9,
    color:         Colors.textSecondary,
    fontWeight:    '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop:     3,
    textAlign:     'center',
  },

  // ── Section sub-label ─────────────────────────────────────────────────────
  subLabel: {
    fontSize:      12,
    fontWeight:    '600',
    color:         Colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom:  10,
  },

  // ── Weekly row ────────────────────────────────────────────────────────────
  weekRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap:        7,
  },
  dayName: {
    color:         Colors.textMuted,
    fontSize:      10,
    textTransform: 'uppercase',
    fontWeight:    '600',
  },
  dayCircle: {
    width:          34,
    height:         34,
    borderRadius:   17,
    borderWidth:    2,
    borderColor:    Colors.border,
    alignItems:     'center',
    justifyContent: 'center',
  },
  dayCircleDone: {
    backgroundColor: Colors.primary,
    borderColor:     Colors.primary,
  },
  dayCheck: { color: Colors.background, fontSize: 15, fontWeight: '800' },
  dayCount: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },

  // ── Today's prayer pills — BUG 4 FIX ────────────────────────────────────
  pillsRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.cardLight,
    borderRadius:      20,
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderWidth:       1,
    borderColor:       Colors.border,
    gap:               4,
  },
  pillDone: {
    borderColor:     Colors.primary + '60',
    backgroundColor: Colors.primary + '18',
  },
  pillText: {
    color:      Colors.textSecondary,
    fontSize:   13,
    fontWeight: '500',
  },
  pillTextDone: {
    color:      Colors.primary,
    fontWeight: '600',
  },
  pillCheck: {
    color:      Colors.primary,
    fontSize:   12,
    fontWeight: '800',
  },

  // ── Quote ─────────────────────────────────────────────────────────────────
  quoteBox: {
    gap: 6,
  },
  quoteIcon: { fontSize: 18 },
  quoteText: {
    color:      Colors.text,
    fontSize:   13,
    lineHeight: 21,
    fontStyle:  'italic',
  },
  quoteRef: {
    color:      Colors.primary,
    fontSize:   12,
    fontWeight: '600',
    alignSelf:  'flex-end',
  },

  // ── Coming-soon tool rows ─────────────────────────────────────────────────
  toolRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  toolIconBox: {
    width:          42,
    height:         42,
    borderRadius:   12,
    backgroundColor: Colors.primary + '18',
    alignItems:     'center',
    justifyContent: 'center',
  },
  toolIcon: { fontSize: 20 },
  toolMeta: { flex: 1 },
  toolTitle: {
    fontSize:   14,
    fontWeight: '600',
    color:      Colors.text,
  },
  toolSub: {
    fontSize:  12,
    color:     Colors.textSecondary,
    marginTop: 2,
  },
  comingSoonBadge: {
    backgroundColor:   Colors.cardLight,
    borderRadius:      8,
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  comingSoonText: {
    fontSize:      10,
    fontWeight:    '600',
    color:         Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Settings rows ─────────────────────────────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  settingMeta: { flex: 1 },
  settingLabel: {
    fontSize:   15,
    fontWeight: '600',
    color:      Colors.text,
  },
  settingHint: {
    fontSize:   12,
    color:      Colors.textSecondary,
    marginTop:  3,
    lineHeight: 17,
  },
  infoRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  infoValue: {
    fontSize:  14,
    color:     Colors.textSecondary,
    fontWeight: '500',
  },
});
