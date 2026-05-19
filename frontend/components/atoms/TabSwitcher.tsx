import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors, FontFamilies, TypeScale } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type TabOption = { value: string; label: string };

export type TabSwitcherProps = {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
};

export function TabSwitcher({ options, value, onChange, style }: TabSwitcherProps) {
  const scheme = useColorScheme() ?? 'light';
  const pal = Colors[scheme];

  return (
    <View
      style={[
        styles.shell,
        {
          borderTopColor: pal.retroFaceShadow,
          borderLeftColor: pal.retroFaceShadow,
          borderBottomColor: pal.retroFaceHighlight,
          borderRightColor: pal.retroFaceHighlight,
          backgroundColor: pal.border,
        },
        style,
      ]}>
      <View
        style={[
          styles.inner,
          {
            borderTopColor: pal.retroFaceHighlight,
            borderLeftColor: pal.retroFaceHighlight,
            borderBottomColor: pal.retroFaceShadow,
            borderRightColor: pal.retroFaceShadow,
            backgroundColor: pal.background,
          },
        ]}>
        <View style={[styles.row, { backgroundColor: pal.surface }]}>
          {options.map((opt, i) => {
            const selected = opt.value === value;
            const showSep = i > 0;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => onChange(opt.value)}
                style={({ pressed }) => [
                  styles.tab,
                  showSep && { borderLeftWidth: 1, borderLeftColor: pal.border },
                  selected && { backgroundColor: pal.tint },
                  pressed && !selected && { backgroundColor: pal.border },
                ]}>
                <Text
                  numberOfLines={1}
                  style={[
                    TypeScale[12],
                    {
                      fontFamily: FontFamilies.semibold,
                      color: selected ? pal.onTint : pal.textMuted,
                      letterSpacing: 0.5,
                    },
                  ]}>
                  {opt.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 2,
    padding: 2,
    alignSelf: 'stretch',
  },
  inner: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
