import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';

/**
 * Today's prayer progress — styled like a tasbih (prayer beads) strand.
 * Each bead shows the prayer's image (round) when pending,
 * and a coloured filled circle with ✓ when completed.
 *
 * Props:
 *   prayers      — ordered array of trackable prayer names, e.g. TRACKABLE_PRAYERS
 *   completed    — array of completed prayer names
 *   activePrayer — name of the currently active / next prayer (gets a blink)
 *   prayerMeta   — { [name]: { icon, image, color } }
 */
export default function PrayerProgressBar({ prayers, completed, activePrayer, prayerMeta }) {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  const total     = prayers.length;
  const doneCount = prayers.filter((p) => completed.includes(p)).length;
  const percent   = total > 0 ? doneCount / total : 0;

  // ── Ring badge geometry ──
  const RING_SIZE = 52;
  const RING_STROKE = 5;
  const RING_R = (RING_SIZE - RING_STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RING_R;

  // ── Blink animation: fades the outer glow ring in and out ──
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  // ── Ripple animation: expands outward and fades ──
  const ripple = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ripple, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ripple, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ripple]);

  const rippleScale   = ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.7, 0.5, 0] });

  return (
    <View style={styles.wrap}>
      {/* ── Header: ring badge + label ── */}
      <View style={styles.headerRow}>
        <View style={styles.ringBadge}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={Colors.border}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={Colors.primary}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * (1 - percent)}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringLabelWrap}>
            <Text style={styles.ringLabel}>{doneCount}/{total}</Text>
          </View>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Today's Prayers</Text>
          <Text style={styles.headerSub}>
            {doneCount === total
              ? 'All prayers completed 🤲'
              : `${total - doneCount} remaining`}
          </Text>
        </View>
      </View>

      {/* ── Beads strand ── */}
      <View style={styles.beadsRow}>
        {/* connector line behind the beads */}
        <View style={styles.connector} pointerEvents="none" />

        {prayers.map((name) => {
          const isDone  = completed.includes(name);
          const isNext  = !isDone && name === activePrayer;
          const meta    = prayerMeta[name] || {};
          const accent  = meta.color || Colors.primary;

          return (
            <View key={name} style={styles.beadColumn}>
              <View style={styles.beadCenter}>

                {/* Ripple ring — expands outward */}
                {isNext && (
                  <Animated.View
                    style={[
                      styles.beadRipple,
                      {
                        borderColor: accent,
                        opacity: rippleOpacity,
                        transform: [{ scale: rippleScale }],
                      },
                    ]}
                  />
                )}

                {isDone ? (
                  /* ── Completed: solid coloured circle with ✓ ── */
                  <View style={[styles.bead, { backgroundColor: accent, borderColor: accent }]}>
                    <Text style={styles.beadCheck}>✓</Text>
                  </View>
                ) : (
                  /* ── Pending / active: round image with blinking border ── */
                  <Animated.View
                    style={[
                      styles.bead,
                      styles.beadPending,
                      isNext && {
                        borderColor: accent,
                        borderWidth: 3,
                        opacity: isNext
                          ? blink.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] })
                          : 1,
                      },
                    ]}
                  >
                    {meta.image ? (
                      <Image
                        source={meta.image}
                        style={styles.beadImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.beadIcon}>{meta.icon}</Text>
                    )}
                  </Animated.View>
                )}
              </View>

              <Text
                style={[
                  styles.beadLabel,
                  isDone && { color: Colors.text, fontWeight: '700' },
                  isNext && { color: accent, fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const BEAD = 42; // slightly larger to show images nicely

const getStyles = (Colors) => StyleSheet.create({
  wrap: {
    marginHorizontal:  16,
    marginVertical:    10,
    backgroundColor:   Colors.card,
    borderRadius:      18,
    borderWidth:       1,
    borderColor:       Colors.border,
    paddingVertical:   16,
    paddingHorizontal: 16,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           14,
    marginBottom:  18,
  },
  ringBadge: {
    width:          52,
    height:         52,
    alignItems:     'center',
    justifyContent: 'center',
  },
  ringLabelWrap: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  ringLabel: {
    color:      Colors.text,
    fontSize:   12,
    fontWeight: '800',
  },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    color:      Colors.text,
    fontSize:   15,
    fontWeight: '700',
  },
  headerSub: {
    color:     Colors.textSecondary,
    fontSize:  12,
    marginTop: 2,
  },

  // Beads strand
  beadsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    position:       'relative',
  },
  connector: {
    position:        'absolute',
    top:             BEAD / 2 - 1,
    left:            BEAD / 2 + 2,
    right:           BEAD / 2 + 2,
    height:          2,
    backgroundColor: Colors.border,
  },
  beadColumn: {
    alignItems: 'center',
    width:      BEAD + 8,
  },
  beadCenter: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  beadRipple: {
    position:     'absolute',
    width:        BEAD,
    height:       BEAD,
    borderRadius: BEAD / 2,
    borderWidth:  2.5,
  },
  bead: {
    width:          BEAD,
    height:         BEAD,
    borderRadius:   BEAD / 2,   // perfect circle
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',   // clips image to circle
  },
  beadPending: {
    backgroundColor: Colors.cardLight,
    borderColor:     Colors.border,
  },
  beadImage: {
    width:        BEAD,
    height:       BEAD,
    borderRadius: BEAD / 2,
  },
  beadIcon: {
    fontSize: 18,
    opacity:  0.8,
  },
  beadCheck: {
    color:      Colors.background,
    fontSize:   17,
    fontWeight: '800',
  },
  beadLabel: {
    color:     Colors.textMuted,
    fontSize:  10,
    marginTop: 6,
  },
});
