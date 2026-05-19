import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { RetroPanel } from '@/components/atoms/RetroPanel';
import { SelectField } from '@/components/atoms/SelectField';
import { TabSwitcher } from '@/components/atoms/TabSwitcher';
import { TerminalLoader } from '@/components/atoms/TerminalLoader';
import { TextField } from '@/components/atoms/TextField';
import { WebShell } from '@/components/organisms/WebShell';
import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import { createMovement, fetchProductStock, fetchProducts } from '@/services/api';
import type { MovementReason, MovementType, Product } from '@/types/inventory';

const REASONS: { value: MovementReason; label: string }[] = [
  { value: 'compra', label: 'Compra' },
  { value: 'venta', label: 'Venta' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'merma', label: 'Merma' },
  { value: 'devolución', label: 'Devolución' },
];

export default function MovementFormScreen() {
  const pal = usePalette();
  const router = useRouter();
  const { productId: initialProductId } = useLocalSearchParams<{ productId?: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(initialProductId ?? '');
  const [type, setType] = useState<MovementType>('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<MovementReason>('compra');
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('No se pudo cargar el catálogo.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialProductId) setProductId(String(initialProductId));
  }, [initialProductId]);

  const loadStock = useCallback(async (id: string) => {
    if (!id) {
      setAvailableStock(null);
      return;
    }
    try {
      const stock = await fetchProductStock(id);
      setAvailableStock(stock);
    } catch {
      setAvailableStock(null);
    }
  }, []);

  useEffect(() => {
    if (type === 'OUT' && productId) {
      loadStock(productId);
    } else {
      setAvailableStock(null);
    }
  }, [type, productId, loadStock]);

  const qtyNum = parseInt(quantity, 10);
  const qtyValid = Number.isInteger(qtyNum) && qtyNum > 0;
  const qtyError = quantity.length > 0 && !qtyValid ? 'Entero positivo requerido' : undefined;

  const exceedsStock =
    type === 'OUT' && availableStock !== null && qtyValid && qtyNum > availableStock;

  const canSubmit = Boolean(productId && qtyValid && reason && !exceedsStock && !submitting);

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name })),
    [products],
  );

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await createMovement({ type, quantity: qtyNum, productId, reason });
      setMessage('>> MOVIMIENTO REGISTRADO OK');
      setQuantity('');
      setType('IN');
      setReason('compra');
      if (type === 'OUT' && productId) loadStock(productId);
    } catch (e: unknown) {
      const msg =
        axiosMessage(e) ?? 'Error al registrar. Revisa stock disponible y datos.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WebShell title="Registro de movimiento">
      {loading ? <TerminalLoader message="LOADING CATALOG" /> : null}

      <RetroPanel style={styles.form}>
        <SelectField
          label="Producto"
          options={productOptions}
          value={productId}
          onChange={setProductId}
          error={!productId && products.length ? 'Selecciona un producto' : undefined}
        />

        <View style={styles.block}>
          <Text style={[TypeScale[12], { fontFamily: FontFamilies.semibold, color: pal.textMuted }]}>
            TIPO
          </Text>
          <TabSwitcher
            options={[
              { value: 'IN', label: 'Entrada' },
              { value: 'OUT', label: 'Salida' },
            ]}
            value={type}
            onChange={(v) => setType(v as MovementType)}
          />
        </View>

        {type === 'OUT' && availableStock !== null ? (
          <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.tint }]}>
            {`STOCK DISPONIBLE: ${availableStock}`}
          </Text>
        ) : null}

        <TextField
          label="Cantidad"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          error={qtyError ?? (exceedsStock ? `Máximo ${availableStock}` : undefined)}
        />

        <SelectField label="Razón" options={REASONS} value={reason} onChange={(v) => setReason(v as MovementReason)} />

        {message ? (
          <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.tint }]}>
            {message}
          </Text>
        ) : null}
        {error ? (
          <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.accent }]}>
            {error}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button variant="primary" disabled={!canSubmit} onPress={onSubmit}>
            {submitting ? 'Enviando...' : 'Registrar'}
          </Button>
          <Button variant="ghost" onPress={() => router.push('/' as Href)}>
            Volver a lista
          </Button>
        </View>
      </RetroPanel>
    </WebShell>
  );
}

function axiosMessage(e: unknown): string | null {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const res = (e as { response?: { data?: { message?: string | string[] } } }).response;
    const m = res?.data?.message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string') return m;
  }
  return null;
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  block: { gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
});
