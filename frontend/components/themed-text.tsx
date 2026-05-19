import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamilies, TypeScale } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const linkTint = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

  return (
    <Text
      style={[
        { color, fontFamily: FontFamilies.regular },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: linkTint }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...TypeScale[16],
    fontFamily: FontFamilies.regular,
  },
  defaultSemiBold: {
    ...TypeScale[16],
    fontFamily: FontFamilies.semibold,
  },
  title: {
    ...TypeScale[32],
    fontFamily: FontFamilies.semibold,
  },
  subtitle: {
    ...TypeScale[20],
    fontFamily: FontFamilies.semibold,
  },
  link: {
    ...TypeScale[14],
    fontFamily: FontFamilies.regular,
  },
});
