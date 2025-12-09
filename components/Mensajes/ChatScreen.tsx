import { AuthContext } from '@/components/Login/AuthContext';
import { colors } from '@/constants/coloresVistaPrincipal';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { router, useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MatchDetalle, matchingService } from '../services/matching.service';
import { Mensaje, mensajesService } from '../services/mensajes.service';
import { MatchBanner } from './MatchBanner';

interface ChatScreenProps {
    usuarioDestinoId: number;
    juegoId: number;
    nombreDestino: string;
}

export default function ChatScreen({ usuarioDestinoId, juegoId, nombreDestino }: ChatScreenProps) {
    // 1. HOOKS PRIMERO (Siempre arriba)
    const context = useContext(AuthContext);
    const currentUserId = context?.userInfo?.id;
    const navigation = useNavigation();
    const headerHeight = useHeaderHeight(); // <--- MOVIDO AQUÍ (Arregla el error de Hooks)

    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [matchInfo, setMatchInfo] = useState<MatchDetalle | null>(null);
    const [cargando, setCargando] = useState(true);

    // 2. FUNCIÓN DE CARGA (Definida fuera del useEffect para reusarla)
    const inicializarChat = async (esRecarga = false) => {
        if (!currentUserId) return;
        
        try {
            if (!esRecarga) setCargando(true);
            
            // a. Traemos matches confirmados y pendientes
            const todosMisMatches = await matchingService.getMyMatches(currentUserId);
            
            // b. Buscamos el match de este juego
            let matchEncontrado = todosMisMatches.find(m => 
                m.juego.id === juegoId && 
                (m.usuario1.id === usuarioDestinoId || m.usuario2.id === usuarioDestinoId)
            );

            // c. Fallback: buscar si ya son amigos en general
            if (!matchEncontrado) {
                matchEncontrado = todosMisMatches.find(m => 
                    m.matchConfirmado && 
                    (m.usuario1.id === usuarioDestinoId || m.usuario2.id === usuarioDestinoId)
                );
            }

            if (matchEncontrado) {
                console.log(`[Chat] Match encontrado: ${matchEncontrado.id}`);
                setMatchInfo(matchEncontrado);
                const historial = await mensajesService.obtenerConversacion(currentUserId, usuarioDestinoId);
                setMensajes(historial);
            } else {
                console.log("[Chat] No hay match previo (se creará al enviar mensaje).");
                setMatchInfo(null);
            }
        } catch (error) {
            console.error("[Chat] Error inicializando:", error);
        } finally {
            if (!esRecarga) setCargando(false);
        }
    };

    // 3. EFECTOS
    useEffect(() => {
        navigation.setOptions({
            title: nombreDestino || 'Chat',
            headerTitleStyle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: colors.primaryAccent,
        });
    }, [nombreDestino, navigation]);

    useEffect(() => {
        inicializarChat(); // Carga inicial

        // Polling para mensajes nuevos
        const interval = setInterval(async () => {
            if (currentUserId && usuarioDestinoId) {
                const msjs = await mensajesService.obtenerConversacion(currentUserId, usuarioDestinoId);
                setMensajes(msjs);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [currentUserId, usuarioDestinoId, juegoId]);

    // 4. MANEJADORES
    const handleEnviar = async () => {
        if (!nuevoMensaje.trim() || !currentUserId) return;

        try {
            // LÓGICA LAZY MATCH: Si no hay match, lo creamos primero
            if (!matchInfo) {
                console.log("[HandleEnviar] Creando match inicial...");
                const nuevoMatchSimple = await matchingService.crearMatch(currentUserId, usuarioDestinoId, juegoId);
                
                if (!nuevoMatchSimple) throw new Error("Error creando el match.");

                // TRUCO IMPORTANTE:
                // No usamos 'nuevoMatchSimple' directamente porque le faltan datos (usuario1, usuario2).
                // En su lugar, recargamos todo desde el servidor para obtener el objeto completo.
                await inicializarChat(true); 
            }

            // Enviamos el mensaje
            await mensajesService.enviarMensaje(currentUserId, usuarioDestinoId, nuevoMensaje);
            setNuevoMensaje('');
            
            // Actualizamos la conversación
            const msjs = await mensajesService.obtenerConversacion(currentUserId, usuarioDestinoId);
            setMensajes(msjs);

        } catch (error: any) {
            console.error("Error al enviar:", error);
            alert("No se pudo enviar el mensaje.");
        }
    };

    const handleAceptarMatch = async () => {
        if (!matchInfo || !currentUserId) return;
        const exito = await matchingService.aceptarMatch(matchInfo.id, currentUserId);
        if (exito) {
            // Recargamos para actualizar el estado visual
            inicializarChat(true);
        }
    };

    const handleRechazarMatch = async () => {
        if (!matchInfo || !currentUserId) return;
        const exito = await matchingService.rechazarMatch(matchInfo.id, currentUserId);
        if (exito) router.back();
    };

    const formatearFecha = (fechaISO: string) => {
        if (!fechaISO) return '';
        const fecha = new Date(fechaISO);
        return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    };

    // 5. VALIDACIONES DE RENDERIZADO
    if (!currentUserId) return <View style={styles.center}><Text style={{ color: 'white' }}>Sesión no válida</Text></View>;
    if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryAccent} /></View>;

    // Lógica segura para saber si necesito aceptar (usando ? para evitar crash)
    const necesitaAceptar = matchInfo?.usuario1 && matchInfo?.usuario2
        ? (matchInfo.usuario1.id === currentUserId && !matchInfo.aceptadoPorUsuario1) ||
          (matchInfo.usuario2.id === currentUserId && !matchInfo.aceptadoPorUsuario2)
        : false;

    const esInputHabilitado = matchInfo?.matchConfirmado || !necesitaAceptar;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 80}
            >
                {matchInfo && (
                    <MatchBanner
                        esConfirmado={matchInfo.matchConfirmado}
                        necesitaAceptar={necesitaAceptar}
                        onAceptar={handleAceptarMatch}
                        onRechazar={handleRechazarMatch}
                    />
                )}

                <FlatList
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesListContent}
                    data={[...mensajes].reverse()}
                    keyExtractor={(item) => item.id.toString()}
                    inverted
                    renderItem={({ item }) => (
                        <View style={[
                            styles.burbuja,
                            item.remitenteId === currentUserId ? styles.miMensaje : styles.otroMensaje
                        ]}>
                            <Text style={styles.textoMensaje}>{item.contenido}</Text>
                            <Text style={styles.horaMensaje}>{formatearFecha(item.fechaEnvio)}</Text>
                        </View>
                    )}
                />

                <View style={styles.inputContainer}>
                    {esInputHabilitado ? (
                        <>
                            <TextInput
                                style={styles.input}
                                value={nuevoMensaje}
                                onChangeText={setNuevoMensaje}
                                placeholder="Escribe un mensaje..."
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity onPress={handleEnviar} style={styles.sendButton}>
                                <Ionicons name="send" size={20} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.textBloqueado}>
                            {necesitaAceptar ? "Acepta el match para responder" : "Esperando respuesta..."}
                        </Text>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#121212' },
    keyboardContainer: { flex: 1 },
    messagesList: { flex: 1, backgroundColor: '#121212' },
    messagesListContent: { paddingHorizontal: 10, paddingVertical: 5 },
    burbuja: { padding: 12, borderRadius: 18, marginVertical: 4, maxWidth: '75%' },
    miMensaje: { backgroundColor: colors.primaryAccent, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
    otroMensaje: { backgroundColor: '#333', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
    textoMensaje: { color: 'white', fontSize: 15 },
    horaMensaje: { fontSize: 10, color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-end', marginTop: 4 },
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#1E1E1E', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333' },
    input: { flex: 1, backgroundColor: '#2C2C2C', color: 'white', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, fontSize: 16 },
    sendButton: { backgroundColor: colors.primaryAccent, padding: 10, borderRadius: 25 },
    textBloqueado: { color: '#888', textAlign: 'center', width: '100%', padding: 10, fontStyle: 'italic' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
});