// components/Mensajes/ListaChats.tsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '@/components/Login/AuthContext';
import { mensajesService } from '../services/mensajes.service';
import { matchingService, MatchDetalle } from '../services/matching.service';
import { colors } from '@/constants/coloresVistaPrincipal';
import { Ionicons } from '@expo/vector-icons';

export default function ListaChats() {
  const router = useRouter();
  const { userInfo } = useContext(AuthContext)!;
  const [secciones, setSecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarChats = async () => {
    if (!userInfo?.id) return;
    try {
      const pendientes = await matchingService.obtenerPendientes(userInfo.id);
      const confirmados = await matchingService.obtenerConfirmados(userInfo.id);

      const seccionesData = [];

      if (pendientes.length > 0) {
        seccionesData.push({ title: 'Solicitudes Pendientes', data: pendientes, tipo: 'pendiente' });
      }
      
      if (confirmados.length > 0) {
        seccionesData.push({ title: 'Chats Activos', data: confirmados, tipo: 'activo' });
      } else {
        // Truco para mostrar mensaje si no hay chats activos pero sí pendientes, o viceversa
        seccionesData.push({ title: 'Chats Activos', data: [], tipo: 'activo' });
      }

      setSecciones(seccionesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recargar cada vez que la pantalla gana foco (al volver del chat)
  useFocusEffect(
    useCallback(() => {
      cargarChats();
    }, [userInfo?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarChats();
  };

  const irAlChat = (match: MatchDetalle) => {
    // Determinar quién es el "otro" usuario
    const esUsuario1 = match.usuario1.id === userInfo?.id;
    const otroUsuario = esUsuario1 ? match.usuario2 : match.usuario1;

    router.push({
      pathname: "/chat/chat",
      params: { 
        usuarioDestinoId: otroUsuario.id,
        juegoId: match.juego.id, // ID del juego para el contexto
        nombreDestino: otroUsuario.username
      }
    });
  };

  const renderItem = ({ item }: { item: MatchDetalle }) => {
    const esUsuario1 = item.usuario1.id === userInfo?.id;
    const otroUsuario = esUsuario1 ? item.usuario2 : item.usuario1;
    
    // Avatar o placeholder
    const avatarSource = otroUsuario.avatarUrl 
        ? { uri: otroUsuario.avatarUrl }
        : { uri: `https://ui-avatars.com/api/?name=${otroUsuario.username}&background=random&color=fff` };

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => irAlChat(item)}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.username}>{otroUsuario.username}</Text>
          <Text style={styles.gameName}>
            {item.juego.nombre} • {item.matchConfirmado ? "Conectado" : "Esperando..."}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primaryAccent} /></View>;

  return (
    <View style={styles.container}>
      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title, data } }) => (
           // Solo mostramos el header si hay datos o si es la sección de activos (para que no se vea vacío feo)
           (data.length > 0 || title === 'Chats Activos') ? 
           <Text style={styles.header}>{title}</Text> : null
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={50} color="#555" />
            <Text style={styles.emptyText}>No tienes chats activos.</Text>
            <Text style={styles.emptySub}>Busca jugadores en "Explorar" para empezar.</Text>
          </View>
        }
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryAccent} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: {
    color: colors.primaryAccent,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.cardBackground, // O '#1E1E1E'
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  infoContainer: { flex: 1 },
  username: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  gameName: { color: '#888', fontSize: 13, marginTop: 2 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyText: { color: 'white', fontSize: 18, marginTop: 10, fontWeight: 'bold' },
  emptySub: { color: '#888', fontSize: 14, marginTop: 5, textAlign: 'center' }
});