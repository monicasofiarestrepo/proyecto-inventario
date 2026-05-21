import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { FontFamilies, TypeScale } from '@/constants/theme';
import { usePalette } from '@/hooks/use-palette';

const NAV = [
  { href: '/', label: 'Productos' },
  { href: '/movement', label: 'Movimiento' },
  { href: '/history', label: 'Historial' },
  { href: '/products', label: 'Catálogo' },
  { href: '/components', label: 'UI Kit' },
] as const;

type PixelKey = 't' | 'a' | 'm' | 's';

const LOGO_CRATE: string[] = [
  '..ttt..',
  '.tssst.',
  'ttssast',
  '.tssst.',
  '..ttt..',
];

const DECOR_LEFT: string[] = ['m..m', '.t..', 'm.tm', '..t.', 'mt.m', '.m.m', 'm..m', '.t.m'];

const DECOR_RIGHT: string[] = ['m..m', '..t.', 'm.tm', '..t.', 'mt.m', 'm.m.', 'm..m', 'm.t.'];

type WebShellProps = {
  title: string;
  children: ReactNode;
  scroll?: boolean;
};

function pixelColor(key: PixelKey, pal: ReturnType<typeof usePalette>) {
  if (key === 't') return pal.tint;
  if (key === 'a') return pal.accent;
  if (key === 'm') return pal.textMuted;
  return pal.surface;
}

function PixelGrid({
  rows,
  pixelSize,
  pal,
}: {
  rows: string[];
  pixelSize: number;
  pal: ReturnType<typeof usePalette>;
}) {
  return (
    <View style={styles.pixelGrid}>
      {rows.map((row, y) => (
        <View key={`r-${y}`} style={styles.pixelRow}>
          {row.split('').map((cell, x) => {
            if (cell === '.') {
              return <View key={`${y}-${x}`} style={{ width: pixelSize, height: pixelSize }} />;
            }
            const key = cell as PixelKey;
            return (
              <View
                key={`${y}-${x}`}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: pixelColor(key, pal),
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function WebShell({ title, children, scroll = true }: WebShellProps) {
  const pal = usePalette();
  const router = useRouter();
  const pathname = usePathname();

  const body = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={styles.body}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: pal.background }]} edges={['top']}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: pal.surface,
            borderBottomColor: pal.dataBorder,
          },
        ]}>
        <View style={[styles.headerAccent, { backgroundColor: pal.accent }]} />
        <View style={styles.brandRow}>
          <PixelGrid rows={DECOR_LEFT} pixelSize={3} pal={pal} />
          <View style={styles.brandCore}>
            <View style={[styles.logoFrame, { borderColor: pal.tint, backgroundColor: pal.background }]}>
              <PixelGrid rows={LOGO_CRATE} pixelSize={4} pal={pal} />
            </View>
            <View style={styles.brandText}>
              <View style={styles.logoTitleRow}>
                <Text style={[TypeScale[20], styles.logoMain, { color: pal.tint }]}>INVENTARIO</Text>
                <Text style={[TypeScale[20], styles.logoSys, { color: pal.accent }]}>_SYS</Text>
              </View>
              <Text style={[TypeScale[11], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
                {`// ${title.toUpperCase()}`}
              </Text>
              <Text style={[TypeScale[11], { fontFamily: FontFamilies.semibold, color: pal.tint }]}>
                ● ONLINE
              </Text>
            </View>
          </View>
          <PixelGrid rows={DECOR_RIGHT} pixelSize={3} pal={pal} />
        </View>
        <View style={[styles.navRule, { backgroundColor: pal.dataBorder }]} />
        <View style={styles.nav}>
          {NAV.map((item) => {
            const active =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Button
                key={item.href}
                variant={active ? 'primary' : 'ghost'}
                onPress={() => router.push(item.href as Href)}>
                {item.label}
              </Button>
            );
          })}
        </View>
      </View>
      <View style={[styles.frame, Platform.OS === 'web' && styles.webFrame]}>{body}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
    overflow: 'hidden',
  },
  headerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.85,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  brandCore: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    minWidth: 0,
  },
  logoFrame: {
    borderWidth: 1,
    padding: 6,
  },
  brandText: { gap: 2, flexShrink: 1 },
  logoTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  logoMain: { fontFamily: FontFamilies.bold, letterSpacing: 1 },
  logoSys: { fontFamily: FontFamilies.bold, letterSpacing: 1 },
  navRule: { height: 1, opacity: 0.35 },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pixelGrid: { gap: 0 },
  pixelRow: { flexDirection: 'row' },
  frame: { flex: 1 },
  webFrame: { maxWidth: 960, width: '100%', alignSelf: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  body: { flex: 1, padding: 20 },
});
