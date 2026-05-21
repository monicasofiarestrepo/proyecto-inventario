import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { RetroPanel } from '@/components/atoms/RetroPanel';
import { SelectField } from '@/components/atoms/SelectField';
import { TerminalLoader } from '@/components/atoms/TerminalLoader';
import { TextField } from '@/components/atoms/TextField';
import { WebShell } from '@/components/organisms/WebShell';
import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';
import {
  createProduct,
  deactivateProduct,
  fetchProducts,
  getApiErrorMessage,
  updateProduct,
} from '@/services/api';
import type { Product, UnitMeasure } from '@/types/inventory';

const UNITS: { value: UnitMeasure; label: string }[] = [
  { value: 'unidades', label: 'Unidades' },
  { value: 'kg', label: 'Kg' },
  { value: 'litros', label: 'Litros' },
];

export default function ProductsManageScreen() {
  const pal = usePalette();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unitMeasure, setUnitMeasure] = useState<UnitMeasure>('unidades');
  const [minStock, setMinStock] = useState('0');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'No se pudo cargar productos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const c = p.category.trim();
      if (c) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  }, [products]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory('');
    setUnitMeasure('unidades');
    setMinStock('0');
  };

  const fillForm = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category);
    setUnitMeasure(p.unitMeasure);
    setMinStock(String(p.minStock));
  };

  const onSave = async () => {
    setError(null);
    setStatus(null);
    const min = parseInt(minStock, 10);
    if (!name.trim() || Number.isNaN(min) || min < 0) {
      setError('Nombre obligatorio y stock mínimo >= 0.');
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      unitMeasure,
      minStock: min,
    };
    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setStatus('>> PRODUCTO ACTUALIZADO');
      } else {
        await createProduct(payload);
        setStatus('>> PRODUCTO CREADO');
      }
      resetForm();
      await load();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Error al guardar producto.'));
    } finally {
      setSaving(false);
    }
  };

  const onDeactivate = async (id: string) => {
    setError(null);
    setSaving(true);
    try {
      await deactivateProduct(id);
      setStatus('>> PRODUCTO DESACTIVADO');
      if (editingId === id) resetForm();
      await load();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'No se pudo desactivar el producto.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <WebShell title="Gestión de productos">
      {loading ? <TerminalLoader message="LOADING PRODUCT ADMIN" /> : null}

      <RetroPanel style={styles.form}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
          {editingId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
        </Text>
        <TextField label="Nombre" value={name} onChangeText={setName} />
        <TextField label="Descripción" value={description} onChangeText={setDescription} />
        <TextField label="Categoría" value={category} onChangeText={setCategory} />
        {existingCategories.length > 0 ? (
          <View style={styles.categoryPicker}>
            <Text style={[TypeScale[11], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
              CATEGORÍAS EXISTENTES
            </Text>
            <View style={styles.categoryRow}>
              {existingCategories.map((c) => (
                <Button key={c} variant="secondary" onPress={() => setCategory(c)}>
                  {c}
                </Button>
              ))}
            </View>
          </View>
        ) : null}
        <SelectField
          label="Unidad"
          options={UNITS}
          value={unitMeasure}
          onChange={(v) => setUnitMeasure(v as UnitMeasure)}
        />
        <TextField
          label="Stock mínimo"
          value={minStock}
          onChangeText={setMinStock}
          keyboardType="number-pad"
        />
        <View style={styles.actions}>
          <Button variant="primary" disabled={saving} onPress={onSave}>
            {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </Button>
          {editingId ? (
            <Button variant="ghost" onPress={resetForm}>
              Cancelar
            </Button>
          ) : null}
        </View>
        {status ? (
          <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.tint }]}>
            {status}
          </Text>
        ) : null}
        {error ? (
          <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.accent }]}>
            {error}
          </Text>
        ) : null}
      </RetroPanel>

      <RetroPanel style={styles.list}>
        {products.length === 0 && !loading ? (
          <Text style={[TypeScale[14], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
            No hay productos activos.
          </Text>
        ) : (
          products.map((p) => (
            <View key={p.id} style={[styles.item, { borderBottomColor: pal.dataBorder }]}>
              <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.text }]}>
                {p.name}
              </Text>
              <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
                {`${p.category} · min ${p.minStock} ${p.unitMeasure}`}
              </Text>
              <View style={styles.actions}>
                <Button variant="secondary" onPress={() => fillForm(p)}>
                  Editar
                </Button>
                <Button variant="ghost" onPress={() => onDeactivate(p.id)}>
                  Desactivar
                </Button>
              </View>
            </View>
          ))
        )}
      </RetroPanel>

      <View style={styles.footer}>
        <Button variant="secondary" onPress={() => router.push('/' as Href)}>
          Ver inventario
        </Button>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12, marginBottom: 16 },
  categoryPicker: { gap: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { gap: 0 },
  item: { paddingVertical: 12, borderBottomWidth: 1, gap: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  footer: { marginTop: 16 },
});
