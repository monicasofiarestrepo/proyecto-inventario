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
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigationDark } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  return (
    <SafeAreaProvider>
      <ThemeProvider value={AppNavigationDark}>
        <Stack screenOptions={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'default' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="movement" />
          <Stack.Screen name="history" />
          <Stack.Screen name="products" />
          <Stack.Screen name="components" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
