import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

type StockBadgeProps = {
  stock: number;
  minStock: number;
  unit?: string;
};

export function StockBadge({ stock, minStock, unit }: StockBadgeProps) {
  const pal = usePalette();
  const critical = stock <= minStock;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!critical) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [critical, opacity]);

  const label = critical ? 'BAJO STOCK' : 'OK';
  const color = critical ? pal.accent : pal.textMuted;

  return (
    <Animated.View style={[styles.badge, { borderColor: color, opacity: critical ? opacity : 1 }]}>
      <Text style={[TypeScale[11], { fontFamily: FontFamilies.semibold, color }]}>
        {label} · {stock}
        {unit ? ` ${unit}` : ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
