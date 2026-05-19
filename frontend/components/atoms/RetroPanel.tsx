import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { usePalette } from '@/hooks/use-palette';

type RetroPanelProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function RetroPanel({ children, style }: RetroPanelProps) {
  const pal = usePalette();
  return (
    <View
      style={[
        styles.panel,
        {
          borderColor: pal.dataBorder,
          backgroundColor: pal.surface,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 0,
    padding: 12,
    alignSelf: 'stretch',
  },
});
