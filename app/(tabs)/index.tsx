import React, { useState, useContext, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { router, useNavigation, useRouter } from 'expo-router'; // <--- IMPORTANTE

// Componentes UI y Tema
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/coloresVistaPrincipal';
import { Ionicons } from '@expo/vector-icons';

// Componentes de Negocio (Juegos y Auth)
import GameListSection from '@/components/Juegos/GameListSection';
import { Game } from '@/components/api/steamApi';
import { AuthContext } from '@/components/Login/AuthContext';
import LoginScreen from '@/components/Login/LoginScreen';
import RegisterScreen from '@/components/Login/RegisterScreen';
import { addGameToUser } from '@/components/services/userGame.service';

// Hooks
import { useTopGames } from '@/hooks/useTopGames';

export default function IndexScreen() {
  // // 1. ESTADO DE AUTENTICACIÓN
  // const { userToken, isLoading: authLoading, logout } = useContext(AuthContext)!;
  // const [isRegistering, setIsRegistering] = useState(false);

  // // 2. HOOKS DE NAVEGACIÓN Y JUEGOS
  // const navigation = useNavigation();
  // const { games, isLoading: gamesLoading, error } = useTopGames();



const handleGamePress = async (game: Game) => {
    console.log(`Seleccionado: ${game.name}`);
    
    if (userInfo?.id) {
      // 1. Registrar que el usuario juega esto (en tu BD)
      // No usamos await para que la navegación sea instantánea
      addGameToUser(userInfo.id, game);
    }

    // 2. Navegar a la pantalla de detalle
    router.push({
     pathname: "/game/[id]",
      params: { 
        id: game.appid, 
        name: game.name, 
        coverUrl: game.coverUrl 
      }
    });
  };






// 1. ESTADO DE AUTENTICACIÓN 
  const authContext = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);

  // 2. HOOKS
  const navigation = useNavigation();
  const { games, isLoading: gamesLoading, error } = useTopGames();

  // PROTECCIÓN: Si el contexto aún no carga, mostramos carga y evitamos el crash
  if (!authContext) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  // Ahora es seguro desestructurar porque sabemos que authContext existe
  const { userToken, isLoading: authLoading, logout, userInfo } = authContext;



  // 3. EFECTO PARA OCULTAR/MOSTRAR LA BARRA DE TABS
  useEffect(() => {
    if (!userToken) {
      // Si NO hay usuario (estamos en Login/Registro), ocultamos el Header y bloqueamos el swipe
      navigation.setOptions({
        headerShown: false,
        swipeEnabled: false, // Evita que se abra el menú deslizando
      });
    } else {
      // Si hay usuario, mostramos el Header y permitimos el swipe
      navigation.setOptions({
        headerShown: true,
        swipeEnabled: true,
        // El estilo del header ya se define en _layout, pero puedes sobreescribirlo aquí si quieres
      });
    }
  }, [userToken, navigation]);



  // --- LÓGICA DE DECISIÓN DE PANTALLA ---

  // CASO 1: Verificando sesión
  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
        <ThemedText style={styles.loadingText}>Verificando sesión...</ThemedText>
      </View>
    );
  }

  // CASO 2: No hay usuario -> Login o Registro
  if (!userToken) {
    if (isRegistering) {
      return <RegisterScreen onLoginPress={() => setIsRegistering(false)} />;
    }
    return <LoginScreen onRegisterPress={() => setIsRegistering(true)} />;
  }

  // CASO 3: Hay usuario -> App Principal

  if (gamesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondaryAccent} />
        <ThemedText style={styles.loadingText}>Cargando catálogo...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity onPress={logout} style={styles.retryButton}>
          <Text style={styles.retryText}>Recargar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trendingGames = games.slice(0, 10);
  const recommendedGames = games.slice(10, 20);

  return (
    <View style={{ flex: 1 }}>
      {/* <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Team Finder</ThemedText>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.primaryAccent} />
        </TouchableOpacity>
      </View> */}

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <GameListSection title="Tendencias" data={trendingGames} onGamePress={handleGamePress} />
        <GameListSection title="Para ti" data={recommendedGames} onGamePress={handleGamePress} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Noticias</ThemedText>
          <View style={styles.adPlaceholder}>
            <ThemedText style={styles.adText}>Espacio Publicitario</ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
  },
  loadingText: {
    marginTop: 10,
    color: colors.secondaryText,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: colors.primaryBackground,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    textTransform: 'uppercase',
  },
  logoutButton: {
    padding: 5,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.secondaryAccent,
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  adPlaceholder: {
    height: 120,
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondaryText,
    borderStyle: 'dashed',
  },
  adText: {
    color: colors.secondaryText,
  },
  retryButton: {
    padding: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 8
  },
  retryText: {
    color: colors.primaryText
  }
});