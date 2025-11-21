// app/game/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors } from '@/constants/coloresVistaPrincipal';
import { getPlayersByGame, PlayerMatch } from '@/components/services/userGame.service'; // Importa tu servicio
import { Ionicons } from '@expo/vector-icons';

export default function GameDetailScreen() {
  // Recibimos los parámetros enviados desde el index
  const { id, name, coverUrl } = useLocalSearchParams(); 
  
  const [players, setPlayers] = useState<PlayerMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (id) {
        try {
          // Convertimos id a número porque viene como string de la URL
          const appIdNumber = Number(id);
          const data = await getPlayersByGame(appIdNumber);
          setPlayers(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlayers();
  }, [id]);

  // Renderizado de cada jugador en la lista
  const renderPlayer = ({ item }: { item: PlayerMatch }) => (
    <View style={styles.playerCard}>
        <Ionicons name="person-circle" size={45} color={colors.primaryAccent} />
        <View style={{marginLeft: 12, flex: 1}}>
            {/* Ajusta estas propiedades según lo que realmente devuelva tu JSON del GET */}
            <Text style={styles.playerName}>{item.username || "Usuario Desconocido"}</Text>
            <Text style={styles.playerRank}>{item.estiloJuego || "Jugador de TeamFinder"}</Text>
        </View>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.secondaryText} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Configuración del Header de Navegación */}
      <Stack.Screen 
        options={{ 
            title: name as string, 
            headerStyle: { backgroundColor: colors.primaryBackground },
            headerTintColor: colors.primaryText,
            
        }} 
      />
      
      {/* Header Visual con la imagen del juego */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: coverUrl as string }} style={styles.coverBackground} blurRadius={5} />
        <Image source={{ uri: coverUrl as string }} style={styles.coverForeground} resizeMode="contain" />
        <View style={styles.overlay} />
      </View>

      <View style={styles.content}>
        <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>JUGADORES ENCONTRADOS</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{players.length}</Text>
            </View>
        </View>
        
        {loading ? (
          <View style={{flex: 1, justifyContent: 'center'}}>
             <ActivityIndicator size="large" color={colors.secondaryAccent} />
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item, index) => index.toString()} // Usamos index por si el id se repite o no viene
            renderItem={renderPlayer}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={60} color={colors.borderColor} />
                    <Text style={styles.emptyText}>Nadie ha agregado este juego a su lista aún.</Text>
                    <Text style={styles.emptySubText}>¡Eres el primero!</Text>
                </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBackground },
  
  headerContainer: { height: 220, width: '100%', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  coverBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  coverForeground: { width: 140, height: 180, borderRadius: 8 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },

  content: { flex: 1, padding: 20, marginTop: -20, backgroundColor: colors.primaryBackground, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between' },
  sectionTitle: { color: colors.secondaryAccent, fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'BebasNeue_400Regular' },
  
  badge: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: colors.primaryText, fontWeight: 'bold' },

  playerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.cardBackground, 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1,
    borderColor: colors.borderColor
  },
  playerName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  playerRank: { color: '#aaa', fontSize: 12, marginTop: 2 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: colors.secondaryText, textAlign: 'center', marginTop: 20, fontSize: 16 },
  emptySubText: { color: colors.primaryAccent, fontWeight: 'bold', marginTop: 5 }
});