// app/(tabs)/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/constants/coloresVistaPrincipal';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet } from 'react-native';

// Importaciones de juegos
import { Game } from '@/components/api/steamApi';
import GameCard from '@/components/Juegos/GameCard';
import { useTopGames } from '@/hooks/useTopGames';

// Importaciones de login/registro
import LoginScreen from '../../components/LoginScreen';
import RegisterScreen from '../../components/RegisterScreen';

export default function IndexScreen() {
  // Estado para alternar entre login/registro y home
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'home'>('login');

  const { games, isLoading, error } = useTopGames();

  const handleGamePress = (game: Game) => {
    console.log(`Juego presionado: ${game.name} (ID: ${game.appid})`);
  };

  // Secciones de juegos
  const trendingGames = games.slice(0, 10);
  const recommendedGames = games.slice(10, 20);

  const GameSection = ({ title, data }: { title: string; data: Game[] }) => (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <FlatList
        data={data}
        horizontal
        renderItem={({ item }) => <GameCard game={item} onPress={handleGamePress} />}
        keyExtractor={(item) => item.appid.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContainer}
      />
    </ThemedView>
  );

  // Renderizado condicional
  if (currentScreen === 'login') {
    return <LoginScreen onRegisterPress={() => setCurrentScreen('register')} />;
  }

  if (currentScreen === 'register') {
    return <RegisterScreen onLoginPress={() => setCurrentScreen('login')} />;
  }

  // Pantalla principal de juegos
  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <ThemedText style={styles.loadingText}>Cargando top juegos...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <GameSection title="Juegos tendencia" data={trendingGames} />
      <GameSection title="Juegos recomendados" data={recommendedGames} />

      {/* Sección de Noticias */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Noticias de videojuegos (AD)</ThemedText>
        <ThemedView style={styles.adPlaceholder}>
          <ThemedText style={styles.adText}>Espacio publicitario</ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground, // Negro puro
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.secondaryText,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  errorText: {
    color: colors.primaryAccent,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    color: colors.secondaryAccent,
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  horizontalListContainer: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  adPlaceholder: {
    height: 120,
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryAccent,
    borderStyle: 'dashed',
  },
  adText: {
    color: colors.secondaryAccent,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});