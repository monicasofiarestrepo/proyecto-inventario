import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

import { Colors, FontFamilies, TypeScale } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children: string;
  variant?: Variant;
};

export function Button({ children, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const pal = Colors[scheme];
  const isDisabled = Boolean(disabled);
  const userStyle = typeof style === 'function' ? undefined : style;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) =>
        StyleSheet.flatten([
          styles.base,
          face(pressed && !isDisabled, pal.retroFaceHighlight, pal.retroFaceShadow),
          variantStyle(variant, pal, isDisabled),
          isDisabled ? { opacity: 0.45 } : {},
          userStyle,
        ])
      }
      {...rest}>
      <Text
        style={[
          TypeScale[14],
          { fontFamily: FontFamilies.semibold, color: labelColor(variant, pal, isDisabled) },
        ]}>
        {children}
      </Text>
    </Pressable>
  );
}

function face(pressed: boolean, hi: string, lo: string): ViewStyle {
  const topLeft = pressed ? lo : hi;
  const botRight = pressed ? hi : lo;
  return {
    borderTopColor: topLeft,
    borderLeftColor: topLeft,
    borderBottomColor: botRight,
    borderRightColor: botRight,
  };
}

function variantStyle(variant: Variant, pal: (typeof Colors)['light'], disabled: boolean): ViewStyle {
  if (disabled) {
    return {
      backgroundColor: variant === 'ghost' ? pal.clear : pal.border,
    };
  }
  switch (variant) {
    case 'primary':
      return { backgroundColor: pal.tint };
    case 'secondary':
      return { backgroundColor: pal.surface };
    case 'ghost':
      return { backgroundColor: pal.clear };
  }
}

function labelColor(variant: Variant, pal: (typeof Colors)['light'], disabled: boolean): string {
  if (disabled) return pal.textMuted;
  if (variant === 'primary') return pal.onTint;
  return pal.text;
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
});
