// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "@/components/Login/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        {/* The (tabs) screen corresponds to the folder app/(tabs)/
          We hide the header here because the Drawer inside (tabs) 
          will provide its own header.
        */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* The modal screen is defined in app/modal.tsx
          It's kept outside the (tabs) group so it opens on top of everything.
        */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}