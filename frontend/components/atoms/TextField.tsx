import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Colors, FontFamilies, TypeScale } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, containerStyle, style, editable = true, onFocus, onBlur, ...rest },
  ref,
) {
  const scheme = useColorScheme() ?? 'light';
  const pal = Colors[scheme];
  const [focused, setFocused] = useState(false);
  const disabled = editable === false;

  const face = {
    borderTopColor: focused ? pal.tint : pal.retroFaceHighlight,
    borderLeftColor: focused ? pal.tint : pal.retroFaceHighlight,
    borderBottomColor: focused ? pal.tint : pal.retroFaceShadow,
    borderRightColor: focused ? pal.tint : pal.retroFaceShadow,
  };

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
          face,
          { backgroundColor: pal.surface },
          disabled && { opacity: 0.5 },
        ]}>
        <TextInput
          ref={ref}
          {...rest}
          placeholderTextColor={pal.icon}
          selectionColor={pal.tint}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            TypeScale[14],
            styles.input,
            { fontFamily: FontFamilies.regular, color: pal.text },
            style,
          ]}
        />
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
});

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  box: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: { padding: 0, margin: 0 },
});
