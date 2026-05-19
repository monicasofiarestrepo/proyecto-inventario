import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { TabSwitcher } from '@/components/atoms/TabSwitcher';
import { TextField } from '@/components/atoms/TextField';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const [tab, setTab] = useState('in');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('');
  const [showErr, setShowErr] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Inventario</ThemedText>
        <ThemedText style={styles.hint}>Vista previa de átomos UI.</ThemedText>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle" style={styles.section}>
            TabSwitcher
          </ThemedText>
          <TabSwitcher
            options={[
              { value: 'in', label: 'Entrada' },
              { value: 'out', label: 'Salida' },
            ]}
            value={tab}
            onChange={setTab}
          />
          <ThemedText type="defaultSemiBold" style={styles.valueLine}>
            Activo: {tab === 'in' ? 'Entrada' : 'Salida'}
          </ThemedText>

          <ThemedText type="subtitle" style={styles.section}>
            TextField
          </ThemedText>
          <TextField label="SKU" placeholder="Ej. SKU-001" value={sku} onChangeText={setSku} />
          <View style={styles.spacer} />
          <TextField
            label="Cantidad"
            placeholder="0"
            value={qty}
            onChangeText={setQty}
            keyboardType="number-pad"
            error={showErr ? 'Mínimo 1 unidad' : undefined}
          />
          <View style={styles.row}>
            <Button onPress={() => setShowErr((v) => !v)}>
              {showErr ? 'Quitar error' : 'Mostrar error'}
            </Button>
          </View>

          <ThemedText type="subtitle" style={styles.section}>
            Button
          </ThemedText>
          <View style={styles.row}>
            <Button variant="primary" onPress={() => {}}>
              Primario
            </Button>
            <Button variant="secondary" onPress={() => {}}>
              Secundario
            </Button>
          </View>
          <View style={styles.row}>
            <Button variant="ghost" onPress={() => {}}>
              Ghost
            </Button>
            <Button variant="primary" disabled onPress={() => {}}>
              Disabled
            </Button>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    gap: 8,
  },
  hint: { marginTop: 2, marginBottom: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, gap: 0 },
  section: { marginTop: 20, marginBottom: 10 },
  valueLine: { marginTop: 8 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  spacer: { height: 4 },
});
