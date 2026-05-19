import {
  CascadiaCode_400Regular,
  CascadiaCode_600SemiBold,
  useFonts,
} from '@expo-google-fonts/cascadia-code';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigationDark, AppNavigationLight } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    CascadiaCode_400Regular,
    CascadiaCode_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const navTheme =
    colorScheme === 'dark'
      ? { ...AppNavigationDark, dark: true as const }
      : { ...AppNavigationLight, dark: false as const };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: navTheme.colors.card },
            headerTintColor: navTheme.colors.primary,
            headerTitleStyle: { fontFamily: 'CascadiaCode_600SemiBold', fontSize: 16 },
          }}>
          <Stack.Screen name="index" options={{ title: 'Inventario' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
