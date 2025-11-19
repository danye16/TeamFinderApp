// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "@/components/Login/AuthContext"; // <--- Importante

export default function RootLayout() {
  return (
    // Envolvemos todo en el AuthProvider
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}