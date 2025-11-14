import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/constants/coloresVistaPrincipal';
import React from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet } from 'react-native';
// Importaciones de nuestra lógica y componentes
import { Game } from '@/components/api/steamApi';
import GameCard from '@/components/Juegos/GameCard';
import { useTopGames } from '@/hooks/useTopGames';

export default function HomeScreen() {
  const { games, isLoading, error } = useTopGames();

  const handleGamePress = (game: Game) => {
    console.log(`Juego presionado: ${game.name} (ID: ${game.appid})`);
  };

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

  // Dividimos la lista de juegos en dos: tendencia y recomendados
  const trendingGames = games.slice(0, 10);
  const recommendedGames = games.slice(10, 20);

  // Componente reutilizable para cada sección de juegos
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <GameSection title="Juegos tendencia" data={trendingGames} />
      <GameSection title="Juegos recomendados" data={recommendedGames} />
      
      {/* Sección de Noticias (Placeholder) */}
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
    color: colors.primaryAccent, // Rojo intenso
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
    color: colors.secondaryAccent, // Amarillo vibrante
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
    borderColor: colors.primaryAccent, // Rojo
    borderStyle: 'dashed',
  },
  adText: {
    color: colors.secondaryAccent, // Amarillo
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
