// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "@/components/Login/AuthContext";
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // <-- El mismo color oscuro de tu chat
  },
});