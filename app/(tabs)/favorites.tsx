import GameCard from '@/components/Juegos/GameCard';
import { AuthContext } from '@/components/Login/AuthContext';
import { MatchDetalle, matchingService } from '@/components/services/matching.service'; // <--- IMPORTACIÓN CORREGIDAimport { colors } from '@/constants/coloresVistaPrincipal';
import { getJuegosDelUsuario, JuegoSimple } from '@/components/services/userGame.service'; // <--- Usamos el nuevo servicio
import { colors } from '@/constants/coloresVistaPrincipal';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

type UsuarioPerfil = MatchDetalle['usuario1'];
interface FriendLibrary {
    friendData: UsuarioPerfil;
    games: JuegoSimple[];
}

export default function GamesScreen() {
  const { userInfo } = useContext(AuthContext)!;
  const router = useRouter();
  
  const [myGames, setMyGames] = useState<JuegoSimple[]>([]);
  const [friendsLibraries, setFriendsLibraries] = useState<FriendLibrary[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadAllData = async () => {
        if (!userInfo?.id) return;
        setLoading(true);

        try {
            // 1. Obtener MIS juegos (Usamos el nuevo endpoint también para ti, es más limpio)
            const misJuegos = await getJuegosDelUsuario(userInfo.id);
            setMyGames(misJuegos);

            // 2. Obtener Matches Confirmados
            const matches = await matchingService.getMyMatches(userInfo.id);
            const matchesConfirmados = matches.filter(m => m.matchConfirmado);
            

            // 3. Extraer lista de AMIGOS únicos
            const amigosMap = new Map<number, UsuarioPerfil>();
            matchesConfirmados.forEach(match => {
                const amigo = match.usuario1.id === userInfo.id ? match.usuario2 : match.usuario1;
                console.log(`Match ID ${match.id} confirmado?: ${match.matchConfirmado}`);
                if (!amigosMap.has(amigo.id)) {
                    amigosMap.set(amigo.id, amigo);
                }
            });

            console.log("Matches confirmados:", matchesConfirmados.length);

            // 4. Obtener JUEGOS de cada amigo usando el endpoint BuscarConUsuario
            const amigosUnicos = Array.from(amigosMap.values());
            
            const promesasLibrerias = amigosUnicos.map(async (amigo) => {
                // Aquí llamamos al endpoint que devuelve [ {id:1, nombre:"CS2"...} ]
                const juegosAmigo = await getJuegosDelUsuario(amigo.id);

                return {
                    friendData: amigo,
                    games: juegosAmigo
                };
            });

            const librerias = await Promise.all(promesasLibrerias);
            setFriendsLibraries(librerias);

        } catch (e) {
          console.error("Error cargando datos:", e);
        } finally {
          setLoading(false);
        }
      };

      loadAllData();
    }, [userInfo])
  );

  // Función para manejar la acción al presionar un juego propio
 const handleMyGamePress = (game: JuegoSimple) => {
      router.push({
        pathname: "/game/[id]",
        params: { 
            id: game.steamAppId, 
            name: game.nombre, 
            coverUrl: game.imagenUrl 
        }
      });
  };

  // Función para manejar la acción al presionar un juego de un amigo
 const handleFriendGamePress = (friend: UsuarioPerfil, game: JuegoSimple) => {
      console.log(`Abriendo chat con ${friend.username} sobre ${game.nombre}`);
      
      // Navegamos a la ruta del chat pasando los parámetros necesarios
      router.push({
          pathname: "/chat/chat",
          params: {
              usuarioDestinoId: friend.id,
              nombreUsuarioDestino: friend.username,
              juegoId: game.id // Usamos el ID interno del juego (ej: 1, 2)
          }
      });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryAccent} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* SECCIÓN 1: MI BIBLIOTECA */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
            <Ionicons name="person" size={20} color={colors.primaryAccent} />
            <Text style={styles.headerTitle}> MI BIBLIOTECA</Text>
        </View>
        
        {myGames.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aún no tienes juegos registrados.</Text>
            </View>
        ) : (
            <FlatList
                data={myGames}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <GameCard 
                        game={{ 
                            appid: item.steamAppId, 
                            name: item.nombre, 
                            coverUrl: item.imagenUrl, 
                            playerCount: 0 
                        }}
                        onPress={() => handleMyGamePress(item)}
                        hidePlayerCount={true}
                    />
                )}
            />
        )}
      </View>

      <View style={styles.divider} />

      {/* SECCIÓN 2: JUEGOS DE AMIGOS */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
            <Ionicons name="people" size={24} color={colors.secondaryAccent} />
            <Text style={[styles.headerTitle, { color: colors.secondaryAccent }]}> JUEGOS DE AMIGOS</Text>
        </View>

        {friendsLibraries.length === 0 ? (
            <Text style={styles.emptySub}>Haz Match con alguien para verlos aquí.</Text>
        ) : (
            friendsLibraries.map((lib) => (
                <View key={lib.friendData.id} style={styles.friendBlock}>
                    <View style={styles.friendHeader}>
                        <Image 
                            source={{ uri: lib.friendData.avatarUrl?.trim() || "https://cdn-icons-png.flaticon.com/512/847/847969.png" }} 
                            style={styles.avatar} 
                        />
                        <Text style={styles.friendName}>{lib.friendData.username}</Text>
                    </View>
                    
                    {lib.games.length === 0 ? (
                        <Text style={styles.noGamesText}>Aún no tiene juegos en su biblioteca.</Text>
                    ) : (
                        <FlatList
                            data={lib.games}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => `f_${lib.friendData.id}_${item.id}`}
                            renderItem={({ item }) => (
                                <GameCard 
                                    game={{ appid: item.steamAppId, name: item.nombre, coverUrl: item.imagenUrl, playerCount: 0 }}
                                    onPress={() => handleFriendGamePress(lib.friendData, item)}
                                    hidePlayerCount={true}
                                    actionLabel="IR AL CHAT" // Botón personalizado
                                />
                            )}
                        />
                    )}
                </View>
            ))
        )}
      </View>
      <View style={{height: 60}} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBackground, padding: 15 },
  center: { flex: 1, backgroundColor: colors.primaryBackground, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', letterSpacing: 1, marginLeft: 10 },
  divider: { height: 1, backgroundColor: '#333', marginBottom: 20 },
  emptyContainer: { padding: 20, backgroundColor: '#1a1a1a', borderRadius: 10, alignItems: 'center' },
  emptyText: { color: '#888', fontStyle: 'italic' },
  emptySub: { color: '#666', fontStyle: 'italic', marginLeft: 10, marginTop: 5 },
  friendBlock: { marginBottom: 25 },
  friendHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 5 },
  avatar: { width: 35, height: 35, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#555' },
  friendName: { color: '#ddd', fontSize: 16, fontWeight: 'bold' },
  noGamesText: { color: '#555', fontStyle: 'italic', fontSize: 12, marginLeft: 10 }
});