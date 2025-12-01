import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native';
import { router, useNavigation, useFocusEffect } from 'expo-router'; // <--- IMPORTANTE: useFocusEffect para actualizar al volver

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
// Importamos los servicios necesarios
import { addGameToUser, getGamesByUser } from '@/components/services/userGame.service';

// Hooks
import { useTopGames } from '@/hooks/useTopGames';

export default function IndexScreen() {
  // 1. ESTADO DE AUTENTICACIÓN 
  const authContext = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);

  // 2. HOOKS DE NAVEGACIÓN Y JUEGOS
  const navigation = useNavigation();
  const { games, isLoading: gamesLoading, error } = useTopGames();

  // --- ESTADO PARA "MIS JUEGOS" ---
  const [myGames, setMyGames] = useState<Game[]>([]);

  // PROTECCIÓN: Si el contexto aún no carga
  if (!authContext) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  const { userToken, isLoading: authLoading, logout, userInfo } = authContext;

  // 3. EFECTO PARA OCULTAR/MOSTRAR LA BARRA DE TABS
  useEffect(() => {
    if (!userToken) {
      navigation.setOptions({ headerShown: false, swipeEnabled: false });
    } else {
      navigation.setOptions({ headerShown: true, swipeEnabled: true });
    }
  }, [userToken, navigation]);


  // --- FUNCIÓN PARA CARGAR "MIS JUEGOS" ---
  const fetchMyGames = async () => {
    if (userInfo?.id) {
      try {
        const userGamesData = await getGamesByUser(userInfo.id);
        
        // Transformamos los datos de UserGame a Game
        const formattedGames: Game[] = userGamesData.map(ug => ({
          appid: ug.steamAppId,
          name: ug.nombre,
          coverUrl: ug.imagenUrl,
          playerCount: 0 // Ponemos 0, pero la tarjeta lo ocultará si actualizaste GameCard
        }));
        
        setMyGames(formattedGames);
      } catch (e) {
        console.error("Error cargando mis juegos", e);
      }
    }
  };

  // --- RECARGAR AL VOLVER A LA PANTALLA ---
  // Esto asegura que si agregas un juego en la vista de detalle y vuelves, aparezca aquí.
  useFocusEffect(
    useCallback(() => {
      fetchMyGames();
    }, [userInfo?.id])
  );


  // --- MANEJADORES DE EVENTOS ---

  const handleGamePress = async (game: Game) => {
    console.log(`Seleccionado: ${game.name}`);

    // Tu lógica original: Si estoy logueado, lo agrego al historial/base de datos al entrar
    if (userInfo?.id) {
      addGameToUser(userInfo.id, game);
    }

    // Navegar a la pantalla de detalle
    router.push({
      pathname: "/game/[id]",
      params: {
        id: game.appid,
        name: game.name,
        coverUrl: game.coverUrl
      }
    });
  };

  const handleAddToFavorites = async (game: Game) => {
    if (userInfo?.id) {
      console.log(`Añadiendo a favoritos: ${game.name}`);
      
      // 1. Verificar si ya existe para no duplicar visualmente
      if (myGames.some(g => g.appid === game.appid)) {
        Alert.alert("Aviso", "Este juego ya está en tu lista.");
        return;
      }

      // 2. Actualización Optimista: Lo mostramos inmediatamente en la lista de arriba
      setMyGames(prev => [game, ...prev]);

      // 3. Guardar en la base de datos
      await addGameToUser(userInfo.id, game);
      
      Alert.alert("¡Añadido!", `${game.name} ahora está en tus juegos.`);
      
    } else {
      console.log("Usuario no logueado");
      Alert.alert("Atención", "Debes iniciar sesión para guardar juegos.");
    }
  };

  const handleSearchPress = () => {
    router.push("/search/filter");
  };


  // --- RENDERIZADO (VISTAS DE CARGA Y ERROR) ---

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
        <ThemedText style={styles.loadingText}>Verificando sesión...</ThemedText>
      </View>
    );
  }

  if (!userToken) {
    if (isRegistering) {
      return <RegisterScreen onLoginPress={() => setIsRegistering(false)} />;
    }
    return <LoginScreen onRegisterPress={() => setIsRegistering(true)} />;
  }

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

  // Datos para las listas inferiores
  const trendingGames = games.slice(0, 10);
  const recommendedGames = games.slice(10, 20);

  return (
    <View style={{ flex: 1 }}>
      
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
          <Text style={styles.placeholderText}>Buscar compañeros (Filtrar por Juegos)...</Text>
          <View style={styles.filterIcon}>
            <Ionicons name="options-outline" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

        {/* --- SECCIÓN 1: MIS JUEGOS --- */}
        {/* Solo se renderiza si tienes juegos en tu lista */}
        {myGames.length > 0 && (
            <GameListSection 
                title="Mis Juegos" 
                data={myGames} 
                onGamePress={handleGamePress} 
                // Pasamos función vacía porque aquí el corazón no es necesario para añadir (ya lo tienes)
                onFavoritePress={() => {}} 
                hidePlayerCount={true} // <--- ESTO OCULTA EL CONTADOR (Requiere cambio en GameCard)
            />
        )}

        {/* SECCIÓN 2: TENDENCIAS */}
        <GameListSection 
            title="Tendencias" 
            data={trendingGames} 
            onGamePress={handleGamePress} 
            onFavoritePress={handleAddToFavorites} // <--- Conectamos el corazón
        />

        {/* SECCIÓN 3: PARA TI */}
        <GameListSection 
            title="Para ti" 
            data={recommendedGames} 
            onGamePress={handleGamePress} 
            onFavoritePress={handleAddToFavorites} // <--- Conectamos el corazón
        />

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
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
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
  },
  // Estilos del Buscador
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  placeholderText: {
    flex: 1,
    color: '#aaa',
    marginLeft: 10,
    fontSize: 14,
  },
  filterIcon: {
    backgroundColor: colors.secondaryAccent || '#007AFF',
    padding: 6,
    borderRadius: 8,
  },
});