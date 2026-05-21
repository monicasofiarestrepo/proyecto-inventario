import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
};

export function SelectField({
  label,
  options,
  value,
  onChange,
  error,
  containerStyle,
}: SelectFieldProps) {
  const pal = usePalette();
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text
          style={[
            TypeScale[12],
            { fontFamily: FontFamilies.semibold, color: pal.textMuted, marginBottom: 6 },
          ]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <View
        style={[
          styles.box,
          {
            borderColor: pal.dataBorder,
            backgroundColor: pal.surface,
          },
        ]}>
        <Text
          style={[
            TypeScale[12],
            { fontFamily: FontFamilies.regular, color: pal.textMuted, marginBottom: 8 },
          ]}>
          {selected?.label ?? '—'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityLabel={opt.label}
                accessibilityState={{ selected: active }}
                onPress={() => onChange(opt.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: pal.dataBorder,
                    backgroundColor: active ? pal.tint : pal.clear,
                  },
                ]}>
                <Text
                  style={[
                    TypeScale[11],
                    {
                      fontFamily: FontFamilies.semibold,
                      color: active ? pal.onTint : pal.textMuted,
                    },
                  ]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      {error ? (
        <Text
          style={[
            TypeScale[11],
            { fontFamily: FontFamilies.regular, color: pal.accent, marginTop: 4 },
          ]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  box: { borderWidth: 1, padding: 10 },
  row: { flexGrow: 0 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
});
