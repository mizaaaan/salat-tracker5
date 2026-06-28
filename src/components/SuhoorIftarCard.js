import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';

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
  return { month: HIJRI_MONTHS[hM - 1], isRamadan: hM === 9 };
}

function MiniRing({ progress, color, size = 38 }) {
  const R = (size - 4) / 2;
  const C = 2 * Math.PI * R;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size/2} cy={size/2} r={R} stroke="rgba(255,255,255,0.07)" strokeWidth={3.5} fill="none" />
      <Circle
        cx={size/2} cy={size/2} r={R}
        stroke={color} strokeWidth={3.5} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${C} ${C}`}
        strokeDashoffset={C * (1 - Math.min(Math.max(progress, 0), 1))}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
    </Svg>
  );
}

function Panel({ emoji, label, arabic, time, isNext, cd, progress, color, S }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isNext) { pulse.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.12, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [isNext]);

  return (
    <View style={[S.panel, isNext && { borderColor: color + '50', backgroundColor: color + '0D' }]}>
      <View style={S.ringWrap}>
        <MiniRing progress={progress} color={color} size={38} />
        <Animated.Text style={[S.emoji, { transform: [{ scale: isNext ? pulse : 1 }] }]}>{emoji}</Animated.Text>
      </View>
      <Text style={[S.arabic, { color }]}>{arabic}</Text>
      <Text style={[S.time, { color }]}>{time}</Text>
      {isNext
        ? <Text style={[S.cd, { color }]}>{cd}</Text>
        : <Text style={S.done}>â</Text>
      }
      <Text style={S.label}>{label}</Text>
    </View>
  );
}

export default function SuhoorIftarCard({ fajrTime, maghribTime }) {
  const { colors: C } = useTheme();
  const S = getStyles(C);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now        = Date.now();
  const hijri      = getHijriMonth();
  const suhoorEnd  = fajrTime    ? new Date(fajrTime).getTime()    : null;
  const iftarStart = maghribTime ? new Date(maghribTime).getTime() : null;

  const suhoorIsNext = suhoorEnd  && now < suhoorEnd;
  const iftarIsNext  = iftarStart && now >= (suhoorEnd ?? 0) && now < iftarStart;

  const midnight   = new Date(); midnight.setHours(0,0,0,0);
  const suhoorProg = suhoorEnd  ? Math.max(0, 1 - (suhoorEnd - now) / (suhoorEnd - midnight.getTime())) : 1;
  const iftarProg  = (suhoorEnd && iftarStart)
    ? Math.max(0, (now - suhoorEnd) / (iftarStart - suhoorEnd)) : 1;

  const cdSuhoor = suhoorIsNext && suhoorEnd  ? countdown(suhoorEnd)  : null;
  const cdIftar  = iftarIsNext  && iftarStart ? countdown(iftarStart) : null;
  const activeCd = suhoorIsNext ? cdSuhoor : iftarIsNext ? cdIftar : null;
  const activeLabel = suhoorIsNext ? 'â³ Suhoor ends in' : iftarIsNext ? 'â³ Iftar starts in' : null;
  const activeColor = suhoorIsNext ? '#5BB8D4' : '#C9A84C';

  return (
    <View style={S.card}>
      {/* Top row: title + hijri badge + countdown */}
      <View style={S.topRow}>
        <Text style={S.title}>ð Suhoor & Iftar</Text>
        {activeCd && (
          <View style={[S.cdBadge, { borderColor: activeColor + '55', backgroundColor: activeColor + '15' }]}>
            <Text style={[S.cdBadgeLabel, { color: activeColor }]}>{activeLabel?.replace('â³ ', '')} </Text>
            <Text style={[S.cdBadgeTime, { color: activeColor }]}>{activeCd}</Text>
          </View>
        )}
        <View style={[S.hijriBadge, hijri.isRamadan && { borderColor: '#C9A84C55', backgroundColor: '#C9A84C15' }]}>
          <Text style={[S.hijriText, hijri.isRamadan && { color: '#C9A84C' }]}>
            {hijri.isRamadan ? 'ð Ramadan' : hijri.month}
          </Text>
        </View>
      </View>

      {/* Two panels */}
      <View style={S.panels}>
        <Panel emoji="ð" label="Suhoor ends" arabic="Ø§ÙØ³Ø­ÙØ±"
          time={fmt12(fajrTime)} isNext={suhoorIsNext} cd={cdSuhoor}
          progress={suhoorProg} color="#5BB8D4" S={S} />
        <View style={S.sep} />
        <Panel emoji="ð" label="Iftar time" arabic="Ø§ÙØ¥ÙØ·Ø§Ø±"
          time={fmt12(maghribTime)} isNext={iftarIsNext} cd={cdIftar}
          progress={iftarProg} color="#C9A84C" S={S} />
      </View>
    </View>
  );
}

const getStyles = (C) => StyleSheet.create({
  card: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },

  topRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  title:    { fontSize: 12, fontWeight: '700', color: C.text, marginRight: 2 },

  cdBadge:      { flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3, flex: 1 },
  cdBadgeLabel: { fontSize: 9, fontWeight: '600' },
  cdBadgeTime:  { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  hijriBadge: { backgroundColor: C.cardLight, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 7, paddingVertical: 3 },
  hijriText:  { fontSize: 9, fontWeight: '600', color: C.textSecondary },

  panels: { flexDirection: 'row', alignItems: 'center' },
  sep:    { width: 1, height: 54, backgroundColor: C.border, marginHorizontal: 10 },

  panel:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent', paddingVertical: 6, paddingHorizontal: 6 },
  ringWrap: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  emoji:    { position: 'absolute', fontSize: 16 },

  arabic: { fontSize: 13, fontWeight: '700' },
  time:   { fontSize: 14, fontWeight: '900', letterSpacing: 0.2, position: 'absolute', left: 54, top: 18 },
  cd:     { fontSize: 9,  fontWeight: '700', letterSpacing: 0.3, position: 'absolute', left: 54, bottom: 6 },
  done:   { fontSize: 10, color: '#1AB87A', fontWeight: '800',   position: 'absolute', left: 54, bottom: 6 },
  label:  { fontSize: 8,  color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, position: 'absolute', left: 54, top: 6 },
});
