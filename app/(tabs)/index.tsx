import React, { useState, useContext, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from 'expo-router'; // <--- IMPORTANTE

// Componentes UI y Tema
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/coloresVistaPrincipal';
import { Ionicons } from '@expo/vector-icons';

// Componentes de Negocio (Juegos y Auth)
import GameListSection from '@/components/Juegos/GameListSection';
import { Game } from '@/components/api/steamApi';
import { AuthContext } from '@/components/Login/AuthContext';
import LoginScreen from '@/components/Login/LoginScreen';       
import RegisterScreen from '@/components/Login/RegisterScreen'; 

// Hooks
import { useTopGames } from '@/hooks/useTopGames';

export default function IndexScreen() {
  // 1. ESTADO DE AUTENTICACIÓN
  const { userToken, isLoading: authLoading, logout } = useContext(AuthContext)!;
  const [isRegistering, setIsRegistering] = useState(false);

  // 2. HOOKS DE NAVEGACIÓN Y JUEGOS
  const navigation = useNavigation();
  const { games, isLoading: gamesLoading, error } = useTopGames();

  // 3. EFECTO PARA OCULTAR/MOSTRAR LA BARRA DE TABS
  useEffect(() => {
    if (!userToken) {
      // Si NO hay usuario, ocultamos la barra de abajo
      navigation.setOptions({
        tabBarStyle: { display: 'none' }
      });
    } else {
      // Si hay usuario, la mostramos (puedes ajustar el estilo si tienes uno personalizado)
      navigation.setOptions({
        tabBarStyle: { 
          display: 'flex',
          backgroundColor: colors.primaryBackground,
          borderTopColor: colors.primaryAccent
        }
      });
    }
  }, [userToken, navigation]);

  const handleGamePress = (game: Game) => {
    console.log(`Juego seleccionado: ${game.name}`);
  };

  // --- LÓGICA DE DECISIÓN DE PANTALLA ---

  // CASO 1: Verificando sesión
  if (authLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
        <ThemedText style={styles.loadingText}>Verificando sesión...</ThemedText>
      </ThemedView>
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
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.secondaryAccent} />
        <ThemedText style={styles.loadingText}>Cargando catálogo...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity onPress={logout} style={styles.retryButton}>
            <Text style={styles.retryText}>Recargar Sesión</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const trendingGames = games.slice(0, 10);
  const recommendedGames = games.slice(10, 20);

  return (
    <ThemedView style={{flex: 1}}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Team Finder</ThemedText>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.primaryAccent} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <GameListSection title="Tendencias" data={trendingGames} onGamePress={handleGamePress} />
        <GameListSection title="Para ti" data={recommendedGames} onGamePress={handleGamePress} />
        
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Noticias</ThemedText>
          <ThemedView style={styles.adPlaceholder}>
            <ThemedText style={styles.adText}>Espacio Publicitario</ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
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