import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

type TerminalLoaderProps = {
  message?: string;
};

export function TerminalLoader({ message = 'LOADING SYSTEM DATA' }: TerminalLoaderProps) {
  const pal = usePalette();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 8), 400);
    return () => clearInterval(id);
  }, []);

  const bar = '|'.repeat(tick % 5).padEnd(5, ' ') + '     ';

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          TypeScale[14],
          { fontFamily: FontFamilies.regular, color: pal.tint },
        ]}>
        {`>> ${message}... [${bar}]`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 24, alignItems: 'center' },
});
