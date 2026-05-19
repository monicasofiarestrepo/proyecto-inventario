import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { TextStyle } from 'react-native';

/** Loaded via useFonts; keys match map passed to loadAsync */
export const FontFamilies = {
  regular: 'CascadiaCode_400Regular',
  medium: 'CascadiaCode_500Medium',
  semibold: 'CascadiaCode_600SemiBold',
  bold: 'CascadiaCode_700Bold',
} as const;

/** Cascadia Code sizes (px) + line heights */
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

const purple = '#7C3AED';
const purpleSoft = '#A78BFA';
const pinkSoft = '#F472B6';

export const Colors = {
  light: {
    text: '#2D2640',
    textMuted: '#6B5B7A',
    background: '#FAF8FC',
    surface: '#FFFFFF',
    tint: purple,
    accent: pinkSoft,
    icon: '#8B7C9C',
    border: '#E9E4F0',
    tabIconDefault: '#9B8AAA',
    tabIconSelected: purple,
    retroFaceHighlight: '#FFFFFF',
    retroFaceShadow: '#9A8AAF',
    onTint: '#FDFBFF',
    clear: 'transparent',
  },
  dark: {
    text: '#F3E8FF',
    textMuted: '#C4B5D4',
    background: '#161018',
    surface: '#221E2A',
    tint: purpleSoft,
    accent: pinkSoft,
    icon: '#A89BB8',
    border: '#2D2838',
    tabIconDefault: '#7D6E8F',
    tabIconSelected: purpleSoft,
    retroFaceHighlight: '#4A4358',
    retroFaceShadow: '#0A080C',
    onTint: '#FDFBFF',
    clear: 'transparent',
  },
};

export const AppNavigationLight: Theme = {
  ...DefaultTheme,
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
