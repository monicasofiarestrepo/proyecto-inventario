import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { RetroPanel } from '@/components/atoms/RetroPanel';
import { TerminalLoader } from '@/components/atoms/TerminalLoader';
import { ProductRow } from '@/components/molecules/ProductRow';
import { WebShell } from '@/components/organisms/WebShell';
import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import { API_BASE_URL, fetchLowStockAlerts, fetchProductsWithStock, getApiErrorMessage } from '@/services/api';
import type { ProductWithStock } from '@/types/inventory';

export default function ProductListScreen() {
  const pal = usePalette();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [alertCount, setAlertCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, alerts] = await Promise.all([fetchProductsWithStock(), fetchLowStockAlerts()]);
      setProducts(list);
      setAlertCount(alerts.length);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'No se pudo cargar el inventario.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <WebShell title="Lista de productos">
      <View style={styles.toolbar}>
        <Button variant="primary" onPress={() => router.push('/movement' as Href)}>
          Registrar movimiento
        </Button>
        <Button variant="secondary" onPress={() => router.push('/products' as Href)}>
          Gestionar catálogo
        </Button>
        <Button variant="ghost" onPress={load}>
          Actualizar
        </Button>
      </View>

      <RetroPanel style={styles.stats}>
        <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
          {`ACTIVOS: ${products.length}  |  ALERTAS STOCK: ${alertCount}`}
        </Text>
        <Text style={[TypeScale[11], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
          {`API: ${API_BASE_URL}`}
        </Text>
      </RetroPanel>

      {loading ? <TerminalLoader message="FETCHING PRODUCT REGISTRY" /> : null}
      {error ? (
        <RetroPanel>
          <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.accent }]}>
            {error}
          </Text>
        </RetroPanel>
      ) : null}

      {!loading && !error ? (
        <RetroPanel style={styles.list}>
          {products.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
                Sin productos activos. Crea el primero en Catálogo.
              </Text>
              <Button variant="primary" onPress={() => router.push('/products' as Href)}>
                Ir a catálogo
              </Button>
            </View>
          ) : (
            products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onMovement={(id) =>
                  router.push({ pathname: '/movement', params: { productId: id } } as Href)
                }
              />
            ))
          )}
        </RetroPanel>
      ) : null}
    </WebShell>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  stats: { marginBottom: 16, gap: 4 },
  list: { marginTop: 8 },
  empty: { gap: 12 },
});
