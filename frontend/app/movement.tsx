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
import {
  createMovement,
  fetchProductStock,
  fetchProducts,
  getApiErrorMessage,
} from '@/services/api';
import type { MovementReason, MovementType, Product } from '@/types/inventory';
import {
  formatQuantity,
  parseQuantityInput,
  sanitizeQuantityInput,
} from '@/utils/quantity';

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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
      if (data.length === 0) setProductId('');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'No se pudo cargar el catálogo.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );
  const unitMeasure = selectedProduct?.unitMeasure ?? 'unidades';

  const qtyNum = parseQuantityInput(quantity, unitMeasure);
  const qtyValid = qtyNum !== null && qtyNum > 0;
  const qtyError =
    quantity.length > 0 && !qtyValid
      ? unitMeasure === 'unidades'
        ? 'Entero positivo requerido'
        : 'Cantidad positiva (máx. 3 decimales)'
      : undefined;

  const exceedsStock =
    type === 'OUT' && availableStock !== null && qtyValid && qtyNum > availableStock;

  const canSubmit =
    Boolean(productId && qtyValid && reason && !exceedsStock && !submitting && products.length > 0);

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
      await createMovement({ type, quantity: qtyNum as number, productId, reason });
      setMessage('>> MOVIMIENTO REGISTRADO OK');
      setQuantity('');
      setReason('compra');
      if (type === 'OUT') {
        await loadStock(productId);
      } else {
        setType('IN');
      }
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Error al registrar movimiento.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && products.length === 0) {
    return (
      <WebShell title="Registro de movimiento">
        <RetroPanel style={styles.empty}>
          <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
            No hay productos activos. Crea uno antes de registrar movimientos.
          </Text>
          <Button variant="primary" onPress={() => router.push('/products' as Href)}>
            Ir a catálogo
          </Button>
        </RetroPanel>
      </WebShell>
    );
  }

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
            {`STOCK DISPONIBLE: ${formatQuantity(availableStock, unitMeasure)} ${unitMeasure}`}
          </Text>
        ) : null}

        <TextField
          label="Cantidad"
          value={quantity}
          onChangeText={(text) => setQuantity(sanitizeQuantityInput(text, unitMeasure))}
          keyboardType={unitMeasure === 'unidades' ? 'number-pad' : 'decimal-pad'}
          placeholder={unitMeasure === 'unidades' ? '1' : '0.000'}
          error={
            qtyError ??
            (exceedsStock && availableStock !== null
              ? `Máximo ${formatQuantity(availableStock, unitMeasure)}`
              : undefined)
          }
        />

        <SelectField
          label="Razón"
          options={REASONS}
          value={reason}
          onChange={(v) => setReason(v as MovementReason)}
        />

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
          {message ? (
            <Button variant="secondary" onPress={() => router.push('/' as Href)}>
              Ver inventario
            </Button>
          ) : null}
          <Button variant="ghost" onPress={() => router.push('/' as Href)}>
            Volver a lista
          </Button>
        </View>
      </RetroPanel>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  block: { gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  empty: { gap: 12 },
});
