import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view'; // Asegúrate de que la ruta sea correcta
import { ThemedText } from '@/components/themed-text';
import { Game } from '@/components/api/steamApi';
import GameCard from './GameCard'; // Importamos tu componente GameCard
import { colors } from '@/constants/coloresVistaPrincipal';

interface GameListSectionProps {
  title: string;
  data: Game[];
  onGamePress: (game: Game) => void;
}

const GameListSection = ({ title, data, onGamePress }: GameListSectionProps) => {
  return (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <FlatList
        data={data}
        horizontal
        renderItem={({ item }) => (
          <GameCard game={item} onPress={onGamePress} />
        )}
        keyExtractor={(item) => item.appid.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContainer}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Roboto', // Asegúrate de que esta fuente esté cargada o usa una del sistema
    color: colors.secondaryAccent,
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  horizontalListContainer: {
    paddingLeft: 16,
    paddingRight: 16,
  },
});

export default GameListSection;