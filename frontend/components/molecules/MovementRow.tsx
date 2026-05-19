import { StyleSheet, Text, View } from 'react-native';

import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import type { Movement } from '@/types/inventory';

type MovementRowProps = {
  movement: Movement;
};

export function MovementRow({ movement }: MovementRowProps) {
  const pal = usePalette();
  const isIn = movement.type === 'IN';
  const sign = isIn ? '+' : '-';
  const typeColor = isIn ? pal.tint : pal.accent;
  const name = movement.product?.name ?? movement.productId.slice(0, 8);

  return (
    <View style={[styles.row, { borderBottomColor: pal.dataBorder }]}>
      <View style={styles.main}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.text }]}>
          {name}
        </Text>
        <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
          {movement.reason} · {new Date(movement.createdAt).toLocaleString()}
        </Text>
      </View>
      <Text style={[TypeScale[14], { fontFamily: FontFamilies.bold, color: typeColor }]}>
        {sign}
        {movement.quantity}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  main: { flex: 1, gap: 4 },
});
