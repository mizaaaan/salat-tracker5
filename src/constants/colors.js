// Two full palettes — Forest Green theme
// Replaces dark navy blue with deep forest greens

export const darkColors = {
  // Backgrounds — deep forest greens instead of navy blues
  background:   '#060F08',   // near-black forest green
  card:         '#0D1F0F',   // dark forest card
  cardLight:    '#152718',   // slightly lighter forest
  cardGlow:     '#1A3020',   // forest glow

  // Brand — keep gold, it's beautiful on forest green
  primary:      '#C9A84C',   // Gold (unchanged)
  primaryLight: '#E8C875',
  primaryDim:   '#C9A84C30',

  // Accent — shift blue/purple to forest-complementary tones
  blue:         '#4FC3A0',   // teal-green instead of sky blue
  purple:       '#7C9A4D',   // olive-green instead of purple
  night:        '#0F2A15',   // deep forest for next-prayer card

  // Text
  text:         '#F0FFF2',   // slightly green-tinted white
  textSecondary:'#7AAA82',   // muted forest green
  textMuted:    '#3D6645',   // dark muted green

  // UI
  border:       '#1E4028',   // forest border
  divider:      '#162E1C',   // forest divider
  overlay:      'rgba(0,0,0,0.6)',

  // Status
  success:      '#4CAF50',
  successDim:   '#4CAF5020',
  warning:      '#FF9800',
  danger:       '#F44336',
};

export const lightColors = {
  // Backgrounds — light forest / nature feel
  background:   '#F2FAF3',   // soft mint white
  card:         '#FFFFFF',
  cardLight:    '#EBF5EC',   // very light green tint
  cardGlow:     '#DDEEDE',   // light forest glow

  // Brand
  primary:      '#A9852E',   // Gold (unchanged)
  primaryLight: '#C9A84C',
  primaryDim:   '#A9852E22',

  // Accent
  blue:         '#2E8B57',   // sea green instead of sky blue
  purple:       '#5A7A2E',   // olive instead of purple
  night:        '#D8EFD8',   // soft green card equivalent

  // Text
  text:         '#0D2410',   // deep forest text
  textSecondary:'#3D6645',   // muted forest text
  textMuted:    '#7AAA82',   // light forest muted

  // UI
  border:       '#C8E6C9',   // light green border
  divider:      '#D8EFD8',   // soft green divider
  overlay:      'rgba(0,0,0,0.45)',

  // Status
  success:      '#388E3C',
  successDim:   '#4CAF5020',
  warning:      '#F57C00',
  danger:       '#D32F2F',
};

// Back-compat fallback
export const Colors = darkColors;
