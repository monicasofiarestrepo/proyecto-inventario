import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { RetroPanel } from '@/components/atoms/RetroPanel';
import { SelectField } from '@/components/atoms/SelectField';
import { StockBadge } from '@/components/atoms/StockBadge';
import { TabSwitcher } from '@/components/atoms/TabSwitcher';
import { TerminalLoader } from '@/components/atoms/TerminalLoader';
import { TextField } from '@/components/atoms/TextField';
import { WebShell } from '@/components/organisms/WebShell';
import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

export default function ComponentsScreen() {
  const pal = usePalette();
  const [tab, setTab] = useState('a');
  const [sel, setSel] = useState('1');
  const [text, setText] = useState('');
  const [showLoader, setShowLoader] = useState(false);

  return (
    <WebShell title="UI Kit /components">
      <RetroPanel style={styles.section}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
          TERMINAL LOADER
        </Text>
        {showLoader ? <TerminalLoader /> : null}
        <Button variant="secondary" onPress={() => setShowLoader((v) => !v)}>
          {showLoader ? 'Ocultar loader' : 'Mostrar loader'}
        </Button>
      </RetroPanel>

      <RetroPanel style={styles.section}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
          STOCK BADGE
        </Text>
        <View style={styles.row}>
          <StockBadge stock={12} minStock={5} unit="unidades" />
          <StockBadge stock={2} minStock={5} unit="unidades" />
        </View>
      </RetroPanel>

      <RetroPanel style={styles.section}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
          TAB SWITCHER
        </Text>
        <TabSwitcher
          options={[
            { value: 'a', label: 'Tab A' },
            { value: 'b', label: 'Tab B' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </RetroPanel>

      <RetroPanel style={styles.section}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
          TEXT FIELD
        </Text>
        <TextField label="Demo" value={text} onChangeText={setText} placeholder="Escribe..." error={text === 'x' ? 'Error demo' : undefined} />
      </RetroPanel>

      <RetroPanel style={styles.section}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
          SELECT FIELD
        </Text>
        <SelectField
          label="Opción"
          options={[
            { value: '1', label: 'Uno' },
            { value: '2', label: 'Dos' },
          ]}
          value={sel}
          onChange={setSel}
        />
      </RetroPanel>

      <RetroPanel style={styles.section}>
        <Text style={[TypeScale[14], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
          BUTTONS
        </Text>
        <View style={styles.row}>
          <Button variant="primary">Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </View>
      </RetroPanel>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, marginBottom: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
});
