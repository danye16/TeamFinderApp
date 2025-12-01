import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AuthContext } from '@/components/Login/AuthContext';
import { getGamesByUser, UserGame } from '@/components/services/userGame.service';
import { colors } from '@/constants/coloresVistaPrincipal';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const { userInfo } = useContext(AuthContext)!;
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Usamos useFocusEffect para recargar la lista cada vez que entras a la pestaña
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        if (userInfo?.id) {
          setLoading(true);
          try {
            const myGames = await getGamesByUser(userInfo.id);
            setGames(myGames);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
        }
      };

      loadFavorites();
    }, [userInfo])
  );

  const handleGamePress = (game: UserGame) => {
    // Navegar al detalle del juego usando los datos guardados
    router.push({
        pathname: "/game/[id]",
        params: {
          id: game.steamAppId, // Asegúrate que tu UserGame tenga steamAppId
          name: game.nombre,
          coverUrl: game.imagenUrl
        }
      });
  };

  

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>MIS JUEGOS FAVORITOS</Text>
      
      {games.length === 0 ? (
        <View style={styles.emptyState}>
            <Ionicons name="game-controller-outline" size={60} color="#555" />
            <Text style={styles.emptyText}>Aún no tienes favoritos.</Text>
            <Text style={styles.emptySub}>Dale al corazón en el inicio para agregar juegos.</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // Muestra en rejilla de 2 columnas
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => handleGamePress(item)}
            >
              <Image source={{ uri: item.imagenUrl }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.gameName} numberOfLines={1}>{item.nombre}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.primaryBackground, 
    padding: 15,
    paddingTop: 50 
  },
  centered: { 
    flex: 1, 
    backgroundColor: colors.primaryBackground, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 20,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  // Estilos de tarjeta simple para favoritos
  card: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  cover: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  info: {
    padding: 10,
    alignItems: 'center'
  },
  gameName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.7
  },
  emptyText: {
      color: 'white',
      fontSize: 18,
      marginTop: 10,
      fontWeight: 'bold'
  },
  emptySub: {
      color: '#aaa',
      marginTop: 5
  }
});