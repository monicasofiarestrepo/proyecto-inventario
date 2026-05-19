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

type WebShellProps = {
  title: string;
  children: ReactNode;
  scroll?: boolean;
};

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
      <View style={[styles.header, { borderBottomColor: pal.dataBorder }]}>
        <Text style={[TypeScale[20], { fontFamily: FontFamilies.bold, color: pal.tint }]}>
          {'>> INVENTARIO_SYS'}
        </Text>
        <Text style={[TypeScale[12], { fontFamily: FontFamilies.regular, color: pal.textMuted }]}>
          {title.toUpperCase()}
        </Text>
        <View style={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  frame: { flex: 1 },
  webFrame: { maxWidth: 960, width: '100%', alignSelf: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  body: { flex: 1, padding: 20 },
});
