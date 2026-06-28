import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../constants/ThemeContext';

// ── 18 Dua categories — 3 per row, 6 rows ─────────────────────────────────────
// Order follows a natural daily/life-cycle flow: worship → daily routine →
// special occasions → Qur'an/spiritual → daily needs → life events → social →
// character/etiquette → travel & nature.
//
// ICONS: each category points to a PNG in assets/dua-icons/<key>.png.
// Files don't exist yet — drop your icon images into that folder using the
// exact filenames below and they'll appear automatically, no code changes.
//   assets/dua-icons/
//     salah.png            sleep.png             ramadan.png
//     quran.png             food.png              illness-death.png
//     ruqyah.png            protection.png        social.png
//     family.png            wealth.png            gratitude-repentance.png
//     purification.png      clothing.png          hajj-umrah.png
//     travel.png            nature.png             morning-evening.png
const DUA_CATEGORIES = [
  { key: 'salah',                icon: require('../../assets/dua-icons/salah.png'),                bn: 'সালাত',           en: 'Prayer (Salah)' },
  { key: 'morning-evening',      icon: require('../../assets/dua-icons/morning-evening.png'),      bn: 'সকাল - সন্ধ্যা',    en: 'Morning & Evening' },
  { key: 'sleep',                 icon: require('../../assets/dua-icons/sleep.png'),                bn: 'ঘুম',             en: 'Sleep' },
  { key: 'ramadan',               icon: require('../../assets/dua-icons/ramadan.png'),              bn: 'রামাদান - সিয়াম',  en: 'Ramadan & Fasting' },
  { key: 'quran',                 icon: require('../../assets/dua-icons/quran.png'),                bn: 'কুরআনের দোয়া',     en: 'Qur’anic Supplications' },
  { key: 'food',                  icon: require('../../assets/dua-icons/food.png'),                 bn: 'খাদ্য ও পানীয়',    en: 'Food & Drink' },
  { key: 'illness-death',        icon: require('../../assets/dua-icons/illness-death.png'),        bn: 'অসুস্থতা - মৃত্যু', en: 'Illness & Death' },
  { key: 'ruqyah',                icon: require('../../assets/dua-icons/ruqyah.png'),                bn: 'রুকইয়াহ',         en: 'Ruqyah' },
  { key: 'protection',            icon: require('../../assets/dua-icons/protection.png'),           bn: 'আশ্রয় প্রার্থনা',   en: 'Seeking Protection' },
  { key: 'social',                icon: require('../../assets/dua-icons/social.png'),                bn: 'সামাজিক',         en: 'Social' },
  { key: 'family',                icon: require('../../assets/dua-icons/family.png'),                bn: 'পরিবার',          en: 'Family' },
  { key: 'wealth',                icon: require('../../assets/dua-icons/wealth.png'),                bn: 'সম্পত্তি - রিযিক',   en: 'Wealth & Sustenance' },
  { key: 'gratitude-repentance', icon: require('../../assets/dua-icons/gratitude-repentance.png'), bn: 'শুকরিয়া - অনুতাপ',  en: 'Gratitude & Repentance' },
  { key: 'purification',         icon: require('../../assets/dua-icons/purification.png'),         bn: 'পবিত্রতা',         en: 'Purification' },
  { key: 'clothing',              icon: require('../../assets/dua-icons/clothing.png'),              bn: 'কাপড় পরিধান',      en: 'Clothing' },
  { key: 'hajj-umrah',           icon: require('../../assets/dua-icons/hajj-umrah.png'),           bn: 'হজ্জ - উমরা',       en: 'Hajj & Umrah' },
  { key: 'travel',                icon: require('../../assets/dua-icons/travel.png'),                bn: 'সফর',             en: 'Travel' },
  { key: 'nature',                icon: require('../../assets/dua-icons/nature.png'),                bn: 'প্রকৃতি',          en: 'Nature' },
];

function DuaTile({ item, styles, onPress }) {
  return (
    <TouchableOpacity
      style={styles.tile}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.tileIconWrap}>
        <Image source={item.icon} style={styles.tileIconImage} resizeMode="contain" />
      </View>
      <Text style={styles.tileBn} numberOfLines={1}>{item.bn}</Text>
      <Text style={styles.tileEn} numberOfLines={2}>{item.en}</Text>
    </TouchableOpacity>
  );
}

export default function DuaScreen({ navigation }) {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  const handlePress = (item) => {
    // Hook for future detail screen — currently categories are display-only.
    navigation?.navigate?.('DuaCategory', { category: item });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/dua.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>দোয়া ও যিকর</Text>
          <Text style={styles.headerSubtitle}>Dua & Azkar Collection</Text>
        </View>

        {/* 3-column grid */}
        <View style={styles.grid}>
          {DUA_CATEGORIES.map((item) => (
            <DuaTile
              key={item.en}
              item={item}
              styles={styles}
              onPress={() => handlePress(item)}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  // ── Header ──
  header:        { alignItems: 'center', marginBottom: 20 },
  headerImage:    { width: 80, height: 80, marginBottom: 6 },
  headerTitle:    { fontSize: 20, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: 12.5, color: Colors.textSecondary, marginTop: 2 },

  // ── Grid: 3 columns, equal gutters ──
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    justifyContent: 'space-between',
    rowGap:        12,
  },

  // Each tile is ~31.3% wide so 3 fit per row with 2 gaps of ~3% each.
  // FIXED height (not minHeight) so every tile is identical regardless of
  // text length — previously longer 2-line English labels (e.g. "Gratitude
  // & Repentance") made some tiles taller than others, breaking row
  // alignment and visually clipping the last row against the tab bar.
  tile: {
    width:           '31.3%',
    height:          132,
    backgroundColor: Colors.card,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems:      'center',
    justifyContent:  'center',
  },
  tileIconWrap: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: Colors.primaryDim,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    8,
  },
  tileIconImage: { width: 26, height: 26 },
  tileBn: {
    fontSize:    13,
    fontWeight:  '700',
    color:       Colors.text,
    textAlign:   'center',
    marginBottom: 2,
  },
  tileEn: {
    fontSize:   10,
    color:      Colors.textSecondary,
    textAlign:  'center',
    lineHeight: 13,
    height:     26,   // reserves space for exactly 2 lines, even if text is 1 line
  },
});