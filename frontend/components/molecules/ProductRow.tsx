import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { StockBadge } from '@/components/atoms/StockBadge';
import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import type { ProductWithStock } from '@/types/inventory';

type ProductRowProps = {
  product: ProductWithStock;
  onMovement: (productId: string) => void;
};

export function ProductRow({ product, onMovement }: ProductRowProps) {
  const pal = usePalette();

  return (
    <View style={[styles.row, { borderBottomColor: pal.dataBorder }]}>
      <View style={styles.main}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.text }]}>
          {product.name}
        </Text>
        <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
          {product.category} · {product.unitMeasure}
        </Text>
        <StockBadge stock={product.currentStock} minStock={product.minStock} unit={product.unitMeasure} />
      </View>
      <Button variant="secondary" onPress={() => onMovement(product.id)}>
        Movimiento
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  main: { flex: 1, gap: 6 },
});
