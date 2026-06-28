/**
 * SuhoorIftarCard
 * Suhoor ends at Fajr · Iftar begins at Maghrib
 * Shows today's times + live countdown to whichever is next.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';

// ── helpers ───────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0'); }

function countdown(target) {
  const diff = target - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function fmt12(date) {
  if (!date) return '--:--';
  let h = date.getHours(), m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${pad(m)} ${ampm}`;
}

// Hijri month names (for label)
const HIJRI_MONTHS = [
  'Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",
  'Jumada I','Jumada II','Rajab',"Sha'ban",
  'Ramadan','Shawwal',"Dhul Qa'dah",'Dhul Hijjah',
];

function getHijriMonth() {
  const jd = Math.floor(Date.now() / 86_400_000) + 2_440_588;
  const l  = jd - 1_948_440 + 10_632;
  const n  = Math.floor((l - 1) / 10_631);
  const l2 = l - 10_631 * n + 354;
  const j  = Math.floor((10_985 - l2) / 5_316) * Math.floor((50 * l2) / 17_719)
           + Math.floor(l2 / 5_670) * Math.floor((43 * l2) / 15_238);
  const l3 = l2
           - Math.floor((30 - j) / 15) * Math.floor((17_719 * j) / 50)
           - Math.floor(j / 16) * Math.floor((15_238 * j) / 43) + 29;
  const hM = Math.floor((24 * l3) / 709);
  const hD = l3 - Math.floor((709 * hM) / 24);
  return { month: HIJRI_MONTHS[hM - 1], day: hD, isRamadan: hM === 9 };
}

// ── Arc progress ring ─────────────────────────────────────────────────────────
function ArcRing({ progress, color, size = 56 }) {
  const R   = (size - 6) / 2;
  const C   = 2 * Math.PI * R;
  const off = C * (1 - Math.min(Math.max(progress, 0), 1));
  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={color} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Circle cx={size/2} cy={size/2} r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={5} fill="none" />
      <Circle
        cx={size/2} cy={size/2} r={R}
        stroke={`url(#arcGrad)`} strokeWidth={5} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${C} ${C}`}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
    </Svg>
  );
}

// ── Panel (left = Suhoor, right = Iftar) ─────────────────────────────────────
function Panel({ emoji, label, arabicLabel, time, isNext, countdown: cd, progress, accentColor, S }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isNext) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isNext]);

  return (
    <View style={[S.panel, isNext && { borderColor: accentColor + '55', backgroundColor: accentColor + '10' }]}>
      {/* Arc ring + emoji */}
      <View style={S.ringWrap}>
        <ArcRing progress={progress} color={accentColor} size={56} />
        <Animated.Text style={[S.panelEmoji, { transform: [{ scale: isNext ? pulseAnim : 1 }] }]}>
          {emoji}
        </Animated.Text>
      </View>

      {/* Labels */}
      <Text style={[S.panelArabic, { color: accentColor }]}>{arabicLabel}</Text>
      <Text style={S.panelLabel}>{label}</Text>
      <Text style={[S.panelTime, { color: accentColor }]}>{time}</Text>

      {isNext && (
        <View style={[S.countdownPill, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
          <Text style={[S.countdownText, { color: accentColor }]}>{cd}</Text>
        </View>
      )}
      {!isNext && (
        <View style={S.donePill}>
          <Text style={S.doneText}>✓ Done</Text>
        </View>
      )}
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SuhoorIftarCard({ fajrTime, maghribTime }) {
  const { colors: C } = useTheme();
  const S = getStyles(C);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now      = Date.now();
  const hijri    = getHijriMonth();

  // Suhoor ends at Fajr; Iftar starts at Maghrib
  const suhoorEnd  = fajrTime   ? new Date(fajrTime).getTime()   : null;
  const iftarStart = maghribTime ? new Date(maghribTime).getTime() : null;

  // Which is "next"?
  // Before Fajr → suhoor is next
  // Between Fajr and Maghrib → iftar is next
  // After Maghrib → both done for today
  const suhoorIsNext  = suhoorEnd  && now < suhoorEnd;
  const iftarIsNext   = iftarStart && now >= (suhoorEnd ?? 0) && now < iftarStart;

  // Arc progress — how much of the window has elapsed
  // Suhoor window: midnight → Fajr  (approx 6h)
  const MIDNIGHT   = new Date(); MIDNIGHT.setHours(0,0,0,0);
  const suhoorProg = suhoorEnd
    ? Math.max(0, 1 - (suhoorEnd - now) / (suhoorEnd - MIDNIGHT.getTime()))
    : 1;

  // Iftar window: Fajr → Maghrib (day window)
  const iftarProg = (suhoorEnd && iftarStart)
    ? Math.max(0, (now - suhoorEnd) / (iftarStart - suhoorEnd))
    : 1;

  const cdSuhoor = suhoorIsNext && suhoorEnd ? countdown(suhoorEnd) : null;
  const cdIftar  = iftarIsNext  && iftarStart ? countdown(iftarStart) : null;

  // Today label
  const today = new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={S.card}>
      {/* Header */}
      <View style={S.cardHeader}>
        <View>
          <Text style={S.cardTitle}>🌙 Suhoor & Iftar</Text>
          <Text style={S.cardDate}>{today}</Text>
        </View>
        <View style={[S.hijriBadge, hijri.isRamadan && { backgroundColor: '#C9A84C22', borderColor: '#C9A84C55' }]}>
          <Text style={[S.hijriText, hijri.isRamadan && { color: '#C9A84C' }]}>
            {hijri.isRamadan ? '🌙 Ramadan' : hijri.month}
          </Text>
        </View>
      </View>

      {/* Active banner */}
      {(suhoorIsNext || iftarIsNext) && (
        <View style={[
          S.activeBanner,
          { backgroundColor: suhoorIsNext ? '#5BB8D422' : '#C9A84C22', borderColor: suhoorIsNext ? '#5BB8D455' : '#C9A84C55' },
        ]}>
          <Text style={[S.activeBannerText, { color: suhoorIsNext ? '#5BB8D4' : '#C9A84C' }]}>
            {suhoorIsNext ? '⏳ Suhoor ends in' : '⏳ Iftar starts in'}
          </Text>
          <Text style={[S.activeBannerTime, { color: suhoorIsNext ? '#5BB8D4' : '#C9A84C' }]}>
            {suhoorIsNext ? cdSuhoor : cdIftar}
          </Text>
        </View>
      )}

      {/* Two panels */}
      <View style={S.panels}>
        <Panel
          emoji="🌙"
          label="Suhoor Ends"
          arabicLabel="السحور"
          time={fmt12(fajrTime)}
          isNext={suhoorIsNext}
          countdown={cdSuhoor}
          progress={suhoorProg}
          accentColor="#5BB8D4"
          S={S}
        />

        <View style={S.divider} />

        <Panel
          emoji="🌅"
          label="Iftar Time"
          arabicLabel="الإفطار"
          time={fmt12(maghribTime)}
          isNext={iftarIsNext}
          countdown={cdIftar}
          progress={iftarProg}
          accentColor="#C9A84C"
          S={S}
        />
      </View>

      {/* Footer note */}
      <Text style={S.footer}>
        Suhoor = before Fajr · Iftar = at Maghrib · Times update daily
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const getStyles = (C) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop:        10,
    backgroundColor:  C.card,
    borderRadius:     20,
    borderWidth:      1,
    borderColor:      C.border,
    overflow:         'hidden',
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.08,
    shadowRadius:     12,
    elevation:        4,
  },

  // Header
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 10 },
  cardTitle:   { fontSize: 15, fontWeight: '700', color: C.text },
  cardDate:    { fontSize: 11, color: C.textSecondary, marginTop: 3 },
  hijriBadge:  { backgroundColor: C.cardLight, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 5 },
  hijriText:   { fontSize: 11, fontWeight: '600', color: C.textSecondary },

  // Active countdown banner
  activeBanner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 14, marginBottom: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  activeBannerText: { fontSize: 12, fontWeight: '600' },
  activeBannerTime: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  // Panels row
  panels: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 14, gap: 0 },
  divider:{ width: 1, backgroundColor: C.border, marginVertical: 4, marginHorizontal: 8 },

  // Each panel
  panel: {
    flex:           1,
    alignItems:     'center',
    paddingVertical: 12,
    borderRadius:   14,
    borderWidth:    1,
    borderColor:    'transparent',
    gap:            4,
  },

  ringWrap:    { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  panelEmoji:  { position: 'absolute', fontSize: 22 },
  panelArabic: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  panelLabel:  { fontSize: 10, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  panelTime:   { fontSize: 17, fontWeight: '900', letterSpacing: 0.3, marginTop: 2 },

  countdownPill: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  countdownText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  donePill:    { backgroundColor: C.cardLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  doneText:    { fontSize: 11, color: C.textMuted, fontWeight: '600' },

  footer:      { fontSize: 10, color: C.textMuted, textAlign: 'center', paddingBottom: 10, paddingHorizontal: 16 },
});
