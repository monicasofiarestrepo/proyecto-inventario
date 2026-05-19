import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { TextStyle } from 'react-native';

export const FontFamilies = {
  regular: 'CascadiaCode_400Regular',
  medium: 'CascadiaCode_500Medium',
  semibold: 'CascadiaCode_600SemiBold',
  bold: 'CascadiaCode_700Bold',
} as const;

export const TypeScale = {
  11: { fontSize: 11, lineHeight: 14 },
  12: { fontSize: 12, lineHeight: 16 },
  14: { fontSize: 14, lineHeight: 18 },
  16: { fontSize: 16, lineHeight: 22 },
  20: { fontSize: 20, lineHeight: 26 },
  28: { fontSize: 28, lineHeight: 34 },
  32: { fontSize: 32, lineHeight: 40 },
} as const satisfies Record<number, Pick<TextStyle, 'fontSize' | 'lineHeight'>>;

export type TypeScaleKey = keyof typeof TypeScale;

const bg = '#0A0512';
const base = '#1A0B2E';
const neon = '#BC34FA';
const muted = '#A193B8';
const alert = '#FF2A85';
const onNeon = '#0A0512';

const cyber = {
  text: neon,
  textMuted: muted,
  background: bg,
  surface: base,
  tint: neon,
  accent: alert,
  icon: muted,
  border: neon,
  tabIconDefault: muted,
  tabIconSelected: neon,
  retroFaceHighlight: '#3D2A5C',
  retroFaceShadow: '#050208',
  onTint: onNeon,
  clear: 'transparent',
  dataBorder: neon,
};

export const Colors = {
  light: cyber,
  dark: cyber,
};

export const AppNavigationLight: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

export const AppNavigationDark: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};
