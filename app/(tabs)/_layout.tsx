// app/(tabs)/_layout.tsx
import { AuthContext } from '@/components/Login/AuthContext';
import { colors } from '@/constants/coloresVistaPrincipal';
import { fetchSteamUserData } from '@/constants/steam'; // Importamos tu helper
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';



const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';


const DrawerHeader = () => {
  const { userInfo } = useContext(AuthContext)!;

  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  useEffect(() => {
    const loadAvatar = async () => {
      // VALIDACIÓN ESTRICTA: Si tiene steamId y no está vacío
      if (userInfo?.steamId && userInfo.steamId !== "") {
        setLoadingAvatar(true);
        try {
          const steamData = await fetchSteamUserData(userInfo.steamId);
          if (steamData && steamData.avatar) {
            setAvatarUrl(steamData.avatar);
          } else {
            setAvatarUrl(DEFAULT_AVATAR); // Fallback si falla API Steam
          }
        } catch (error) {
          setAvatarUrl(DEFAULT_AVATAR);
        } finally {
          setLoadingAvatar(false);
        }
      } else {
        // IMPORTANTE: Si no hay SteamID, forzamos la imagen genérica
        // Esto arregla el bug de que se quede la foto anterior
        setAvatarUrl(DEFAULT_AVATAR);
      }
    };

    loadAvatar();
  }, [userInfo]);




  return (
    <ImageBackground
      source={{ uri: 'https://wallpapers.com/images/hd/dark-gaming-background-8kb982028203.jpg' }}
      style={styles.headerBackground}
      imageStyle={{ opacity: 0.4 }}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
        />
        {/* Indicador de estado (Verde = Online) */}
        <View style={styles.statusDot} />

        {loadingAvatar && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="small" color={colors.secondaryAccent} />
          </View>
        )}
      </View>

      <Text style={styles.username}>
        {userInfo?.username || "Jugador"}
      </Text>

      <Text style={styles.userRank}>
        {userInfo?.steamId ? "Verificado Steam" : "Cuenta Local"}
      </Text>
    </ImageBackground>
  );
};

// --- 2. FOOTER ---
const DrawerFooter = ({ onLogout }: { onLogout: () => void }) => (
  <View style={styles.footerContainer}>
    <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
      <Ionicons name="log-out-outline" size={24} color="#FF4444" />
      <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
    </TouchableOpacity>
    <Text style={styles.versionText}>TeamFinder v1.0.0</Text>
  </View>
);

// --- 3. CONTENIDO PRINCIPAL ---
function CustomDrawerContent(props: any) {
  const [refreshing, setRefreshing] = useState(false);
  const { logout, refreshUserData } = useContext(AuthContext)!;


  // Función que se ejecuta al deslizar hacia abajo
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Llamamos a la función del contexto para recargar datos
    await refreshUserData();
    // Simulamos un pequeño delay para que se sienta la recarga si es muy rápida
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [refreshUserData]);

  return (
    <View style={{ flex: 1 }}>
      <DrawerHeader />
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 10 }}
        style={{ flex: 1, backgroundColor: colors.primaryBackground }}
        // AQUI AGREGAMOS EL CONTROL DE REFRESCO
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondaryAccent} // Color del spinner en iOS
            colors={[colors.secondaryAccent]}  // Color del spinner en Android
            progressBackgroundColor={colors.cardBackground} // Fondo del spinner en Android
          />
        }
      >

        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <DrawerFooter onLogout={() => {
          // 1. Cerramos el Drawer explícitamente usando la prop navigation
          props.navigation.closeDrawer();
          
          // 2. Ejecutamos el logout
          logout();
      }} />
    </View>
  );
}

// --- 4. LAYOUT DRAWER (Sin cambios en estructura, solo estilos y rutas) ---
export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primaryBackground,
            borderBottomWidth: 1,
            borderBottomColor: '#333'
          },
          headerTintColor: colors.primaryAccent,
          headerTitleStyle: { fontWeight: 'bold', color: '#FFF', textTransform: 'uppercase' },

          drawerStyle: { backgroundColor: colors.primaryBackground, width: 300 },
          drawerActiveTintColor: colors.primaryBackground,
          drawerActiveBackgroundColor: colors.secondaryAccent,
          drawerInactiveTintColor: colors.secondaryText,
          drawerLabelStyle: { fontWeight: 'bold', marginLeft: -10, fontSize: 16 },
          drawerItemStyle: { borderRadius: 8, marginHorizontal: 10, marginVertical: 5 },
        }}
      >
        {/* Rutas del menú */}
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "INICIO",
            title: "Team Finder",
            drawerIcon: ({ color }) => <Ionicons name="game-controller" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: "MI PERFIL",
            title: "Perfil de Jugador",
            drawerIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="friends"
          options={{
            drawerLabel: "SQUAD / AMIGOS",
            title: "Mi Squad",
            drawerIcon: ({ color }) => <Ionicons name="people" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="favorites"
          options={{
            drawerLabel: "FAVORITOS",
            title: "Biblioteca",
            drawerIcon: ({ color }) => <Ionicons name="heart" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="stats"
          options={{
            drawerLabel: "ESTADÍSTICAS",
            title: "Rendimiento",
            drawerIcon: ({ color }) => <Ionicons name="stats-chart" size={22} color={color} />,
          }}
        />

        <Drawer.Screen name="explore" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    height: 220, // Un poco más alto para que luzca
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    borderBottomWidth: 2,
    borderBottomColor: colors.secondaryAccent,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.secondaryAccent,
    backgroundColor: '#333', // Fondo mientras carga
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 45,
  },
  statusDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#000',
  },
  username: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 2,
  },
  userRank: {
    color: colors.secondaryAccent,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#0a0a0a',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  versionText: {
    color: '#555',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  }
});