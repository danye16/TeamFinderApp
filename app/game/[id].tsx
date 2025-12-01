// app/game/[id].tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/coloresVistaPrincipal';
import { getPlayersByGame, PlayerMatch, getLocalGameId } from '@/components/services/userGame.service';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/components/Login/AuthContext';

// --- HELPER: GENERAR COLOR ALEATORIO BASADO EN EL NOMBRE ---
const getAvatarColor = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// --- HELPER: OBTENER INICIALES ---
const getInitials = (username: string) => {
  return username ? username.slice(0, 2).toUpperCase() : "US";
};

export default function GameDetailScreen() {
  const { id, name, coverUrl } = useLocalSearchParams();
  const router = useRouter();

  const [players, setPlayers] = useState<PlayerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchPlayers = async () => {
      if (id) {
        try {
          const appIdNumber = Number(id);
          const data = await getPlayersByGame(appIdNumber);
          const filteredPlayers = data.filter(player => player.usuarioId !== userInfo?.id);
          setPlayers(filteredPlayers);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlayers();
  }, [id, userInfo]);

  const irAlChat = async (jugador: PlayerMatch) => {
    if (!userInfo?.id) {
      Alert.alert("Atención", "Debes iniciar sesión para enviar mensajes.");
      return;
    }

    try {
      const steamAppId = Number(id);
      const localGameId = await getLocalGameId(steamAppId);

      if (!localGameId) {
        Alert.alert("Error", "No se pudo verificar el juego en la base de datos.");
        return;
      }

      router.push({
        pathname: "/chat/chat",
        params: {
          usuarioDestinoId: jugador.usuarioId,
          juegoId: localGameId,
          nombreDestino: jugador.usuarioUsername
        }
      });
    } catch (error) {
      console.error("Error al iniciar chat:", error);
      Alert.alert("Error", "Hubo un problema al conectar con el chat.");
    }
  };

  const renderPlayer = ({ item }: { item: PlayerMatch }) => {
    // LÓGICA DEL AVATAR
    // 1. Obtenemos la URL y usamos .trim() para quitar los espacios sobrantes
    const rawUrl = item.usuarioAvatarUrl || "";
    const cleanUrl = rawUrl.trim();

    // 2. Verificamos si la URL limpia no está vacía
    const hasAvatar = cleanUrl.length > 0;

    const avatarBackgroundColor = hasAvatar ? 'transparent' : getAvatarColor(item.usuarioUsername || "User");

    //console.error("🔍 DATOS RECIBIDOS DEL JUGADOR:", JSON.stringify(item, null, 2));
    return (
      <View style={styles.playerCard}>

        {/* --- AVATAR O PLACEHOLDER --- */}
        <View style={[styles.avatarContainer, { backgroundColor: avatarBackgroundColor }]}>
          {hasAvatar ? (
            <Image
              source={{ uri: cleanUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(item.usuarioUsername || "User")}
            </Text>
          )}
        </View>

        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.playerName}>
            {item.usuarioUsername || "Usuario Desconocido"}
          </Text>
          <Text style={styles.playerRank}>
            {item.usuarioEstiloJuego || "Jugador Casual"}
          </Text>
        </View>

        <TouchableOpacity onPress={() => irAlChat(item)} style={styles.chatButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.secondaryAccent} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: name as string,
          headerStyle: { backgroundColor: colors.primaryBackground },
          headerTintColor: colors.primaryText,
        }}
      />

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
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.secondaryAccent} />
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item, index) => index.toString()}
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

  // --- ESTILOS NUEVOS PARA EL AVATAR ---
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5, // Circular
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // -------------------------------------

  playerName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  playerRank: { color: '#aaa', fontSize: 12, marginTop: 2 },
  chatButton: { padding: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: colors.secondaryText, textAlign: 'center', marginTop: 20, fontSize: 16 },
  emptySubText: { color: colors.primaryAccent, fontWeight: 'bold', marginTop: 5 }
});