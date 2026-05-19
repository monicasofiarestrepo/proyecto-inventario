import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function usePalette() {
  const scheme = useColorScheme() ?? 'dark';
  return Colors[scheme];
}
