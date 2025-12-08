import React, { useContext, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, Stack } from 'expo-router'; // Para obtener el ID
import { AuthContext } from '@/components/Login/AuthContext';
import { colors } from '@/constants/coloresVistaPrincipal';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams(); // Obtenemos el ID de la URL
  const { userInfo, userToken } = useContext(AuthContext)!;
  const [isLoading, setIsLoading] = useState(true);

  // Construimos la URL dinámica hacia tu PWA
  const PWA_URL = `https://teamfinderpwa.vercel.app/evento/${id}`;

  const authPayload = {
    type: 'AUTH_CREDENTIALS',
    payload: {
      user: userInfo,
      token: userToken || `mobile-token-${userInfo?.id}`
    }
  };

  const injectionScript = `
    (function() {
      try {
        window.postMessage(${JSON.stringify(authPayload)}, '*');
        window.localStorage.setItem('authToken', '${authPayload.payload.token}');
        window.localStorage.setItem('authUser', '${JSON.stringify(authPayload.payload.user)}');
      } catch (e) { console.error(e); }
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      {/* Configuramos el título de la barra superior */}
      <Stack.Screen options={{ title: `Evento #${id}`, headerBackTitle: 'Volver' }} />
      
      <WebView
        source={{ uri: PWA_URL }}
        style={{ flex: 1, backgroundColor: colors.primaryBackground }}
        injectedJavaScript={injectionScript}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        domStorageEnabled={true}
        javaScriptEnabled={true}
      />
      
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.secondaryAccent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBackground },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryBackground }
});