import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { RetroPanel } from '@/components/atoms/RetroPanel';
import { SelectField } from '@/components/atoms/SelectField';
import { TabSwitcher } from '@/components/atoms/TabSwitcher';
import { TerminalLoader } from '@/components/atoms/TerminalLoader';
import { TextField } from '@/components/atoms/TextField';
import { MovementRow } from '@/components/molecules/MovementRow';
import { WebShell } from '@/components/organisms/WebShell';
import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import { fetchMovements, fetchProducts, getApiErrorMessage } from '@/services/api';
import type { Movement, MovementType, Product } from '@/types/inventory';

export default function HistoryScreen() {
  const pal = usePalette();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [productId, setProductId] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MovementType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const productOptions = useMemo(
    () => [{ value: '', label: 'Todos' }, ...products.map((p) => ({ value: p.id, label: p.name }))],
    [products],
  );

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMovements({
        productId: productId || undefined,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setMovements(data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'No se pudo cargar el historial.'));
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [productId, typeFilter, startDate, endDate]);

  useEffect(() => {
    search();
  }, [search]);

  return (
    <WebShell title="Historial de movimientos">
      <RetroPanel style={styles.filters}>
        <SelectField label="Producto" options={productOptions} value={productId} onChange={setProductId} />
        <View style={styles.block}>
          <Text style={[TypeScale[12], { fontFamily: FontFamilies.semibold, color: pal.textMuted }]}>
            TIPO
          </Text>
          <TabSwitcher
            options={[
              { value: 'ALL', label: 'Todos' },
              { value: 'IN', label: 'Entrada' },
              { value: 'OUT', label: 'Salida' },
            ]}
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as 'ALL' | MovementType)}
          />
        </View>
        <TextField
          label="Desde (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2026-01-01"
        />
        <TextField label="Hasta (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} placeholder="2026-12-31" />
        <Button variant="secondary" onPress={search}>
          Filtrar
        </Button>
      </RetroPanel>

      {loading ? <TerminalLoader message="QUERYING MOVEMENT LOG" /> : null}
      {error ? (
        <RetroPanel>
          <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.accent }]}>
            {error}
          </Text>
        </RetroPanel>
      ) : null}

      <RetroPanel style={styles.list}>
        {!loading && !error && movements.length === 0 ? (
          <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
            Sin registros para los filtros actuales.
          </Text>
        ) : (
          movements.map((m) => <MovementRow key={m.id} movement={m} />)
        )}
      </RetroPanel>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 12, marginBottom: 16 },
  block: { gap: 8 },
  list: { marginTop: 8 },
});
