// components/Mensajes/ChatScreen.tsx
import { AuthContext } from '@/components/Login/AuthContext'; // Tu contexto real
import { colors } from '@/constants/coloresVistaPrincipal'; // Usando tus constantes
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { router, useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matchingService, MatchStatus } from '../services/matching.service';
import { Mensaje, mensajesService } from '../services/mensajes.service';
import { MatchBanner } from './MatchBanner';
interface ChatScreenProps {
    usuarioDestinoId: number;
    juegoId: number;
    nombreDestino: string;
}

export default function ChatScreen({ usuarioDestinoId, juegoId, nombreDestino }: ChatScreenProps) {
    // CORRECCIÓN AQUÍ: Usamos 'userInfo' en lugar de 'user'
    const context = useContext(AuthContext);
    const currentUserId = context?.userInfo?.id;

    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [matchInfo, setMatchInfo] = useState<MatchStatus | null>(null);
    const [cargando, setCargando] = useState(true);
    const navigation = useNavigation();
    // useEffect(() => {
    //     if (currentUserId) {
    //         cargarDatos();
    //     }
    //     const intervalo = setInterval(() => {
    //         if (currentUserId) cargarConversacion();

    //     }, 5000);
    //     refrescarEstadoMatch();
    //     return () => clearInterval(intervalo);
    // }, [currentUserId]);
    useEffect(() => {
        navigation.setOptions({
            // Título principal (Nombre del usuario)
            title: nombreDestino || 'Chat',
            // Subtítulo o info extra (depende de la versión de React Navigation, 
            // si no soporta 'headerTitle' complejo, usa solo 'title').
            // Una opción elegante es poner el nombre del juego en el headerBackTitle o similar.
            headerTitleStyle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white' // Asegura que se vea en fondo oscuro
            },
            headerStyle: {
                backgroundColor: '#121212', // Color de fondo de la barra
            },
            headerTintColor: colors.primaryAccent, // Color de la flecha de volver
        });
    }, [nombreDestino, navigation]);
    useEffect(() => {
        if (currentUserId) {
            cargarDatos(); // Carga inicial
        }

        // Intervalo para refrescar mensajes y estado del match
        const intervalo = setInterval(() => {
            if (currentUserId) {
                cargarConversacion();
                refrescarEstadoMatch(); // Para ver si el otro usuario aceptó
            }
        }, 3000); // 3 segundos

        return () => clearInterval(intervalo);
    }, [currentUserId]);

    const cargarDatos = async () => {
        if (!currentUserId) return;
        try {
            const match = await matchingService.crearMatch(currentUserId, usuarioDestinoId, juegoId);
            if (match) {
                setMatchInfo(match);
                await cargarConversacion();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCargando(false);
        }
    };

    const refrescarEstadoMatch = async () => {
        try {
            // Reusamos crearMatch porque tu backend ya devuelve el match existente si lo encuentra
            const match = await matchingService.crearMatch(currentUserId!, usuarioDestinoId, juegoId);
            if (match) {
                // Solo actualizamos si hubo cambios para evitar re-renders innecesarios
                setMatchInfo(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(match)) {
                        return match;
                    }
                    return prev;
                });
            }
        } catch (e) {
            console.log("Error refrescando status", e);
        }
    };
    const cargarConversacion = async () => {
        if (!currentUserId) return;
        const msjs = await mensajesService.obtenerConversacion(currentUserId, usuarioDestinoId);
        setMensajes(msjs);
    };

    const handleEnviar = async () => {
        if (!nuevoMensaje.trim() || !currentUserId) return;

        try {
            await mensajesService.enviarMensaje(currentUserId, usuarioDestinoId, nuevoMensaje);
            setNuevoMensaje('');
            cargarConversacion();
        } catch (error: any) {
            alert(error.message || "Error al enviar mensaje");
        }
    };

    const handleAceptarMatch = async () => {
        if (!matchInfo || !currentUserId) return;
        const exito = await matchingService.aceptarMatch(matchInfo.id, currentUserId);
        if (exito) {
            setMatchInfo({ ...matchInfo, matchConfirmado: true });
        }
    };

    // Rechazar Match
    const handleRechazarMatch = async () => {
        if (!matchInfo || !currentUserId) return;

        // Opcional: Mostrar alerta de confirmación antes
        const exito = await matchingService.rechazarMatch(matchInfo.id, currentUserId);

        if (exito) {
            alert("Match rechazado");
            router.back(); // Regresar a la lista anterior
        } else {
            alert("Error al rechazar");
        }
    };

    if (!currentUserId) return <View style={styles.center}><Text style={{ color: 'white' }}>Error de sesión</Text></View>;
    if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryAccent} /></View>;

    // Lógica de bloqueo (Requerimiento escolar)
    const necesitaAceptar = matchInfo
        ? (matchInfo.usuario1Id === currentUserId && !matchInfo.aceptadoPorUsuario1) ||
        (matchInfo.usuario2Id === currentUserId && !matchInfo.aceptadoPorUsuario2)
        : false;

    // Solo se habilita si está confirmado O si yo ya acepté (estoy esperando al otro)
    // Si yo soy el que falta aceptar, está bloqueado.
    const esInputHabilitado = matchInfo?.matchConfirmado || !necesitaAceptar;

    const headerHeight = useHeaderHeight();


    // return (
        
    //     <KeyboardAvoidingView


    //         behavior={Platform.OS === "ios" ? "padding" : "height"}

    //         // OFFSET: Sumamos un valor extra (ej: 100) si headerHeight no es suficiente en Android.
    //         // A veces headerHeight retorna 0 o un valor incorrecto en ciertas configuraciones de Android.
    //         keyboardVerticalOffset={headerHeight + (Platform.OS === 'android' ? 30 : 0)}

    //         // CHANGE 2: Ensure the background is explicitly dark so no white gaps appear
    //         style={[styles.container, { backgroundColor: '#121212' }]}


    //     >
    //         {/* COMPONENTE COMPOSITE 1: Banner de estado */}
    //         {matchInfo && (
    //             <MatchBanner
    //                 esConfirmado={matchInfo.matchConfirmado}
    //                 necesitaAceptar={necesitaAceptar}
    //                 onAceptar={handleAceptarMatch}
    //                 onRechazar={handleRechazarMatch} // <--- Pasamos la nueva función
    //             />
    //         )}

    //         <FlatList
    //             contentContainerStyle={{
    //                 flexDirection: 'column-reverse',
    //                 padding: 10,
    //                 paddingBottom: 20,
    //                 flexGrow: 1 // Asegura que la lista empuje el contenido si es necesario
    //             }}
    //             data={mensajes}
    //             keyExtractor={(item) => item.id.toString()}
    //             inverted
    //             renderItem={({ item }) => (
    //                 <View style={[
    //                     styles.burbuja,
    //                     item.remitenteId === currentUserId ? styles.miMensaje : styles.otroMensaje
    //                 ]}>
    //                     <Text style={styles.textoMensaje}>{item.contenido}</Text>
    //                 </View>
    //             )}

    //         />

    //         <View style={styles.inputContainer}>
    //             {esInputHabilitado ? (
    //                 <>
    //                     <TextInput
    //                         style={styles.input}
    //                         value={nuevoMensaje}
    //                         onChangeText={setNuevoMensaje}
    //                         placeholder="Escribe un mensaje..."
    //                         placeholderTextColor="#888"
    //                     />
    //                     <TouchableOpacity onPress={handleEnviar} style={styles.sendButton}>
    //                         <Ionicons name="send" size={20} color="white" />
    //                     </TouchableOpacity>
    //                 </>
    //             ) : (
    //                 <Text style={styles.textBloqueado}>
    //                     {necesitaAceptar ? "Debes aceptar el match para responder" : "Esperando que acepten tu solicitud..."}
    //                 </Text>
    //             )}
    //         </View>
    //     </KeyboardAvoidingView>
    // );

    return (
    <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            // CAMBIO CLAVE: Usamos 'height' para Android y 'padding' para iOS
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // El offset es necesario para iOS para compensar el header. En Android con 'height' no es necesario.
            keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : + 80}
        >
            {/* Banner de estado del Match */}
            {matchInfo && (
                <MatchBanner
                    esConfirmado={matchInfo.matchConfirmado}
                    necesitaAceptar={necesitaAceptar}
                    onAceptar={handleAceptarMatch}
                    onRechazar={handleRechazarMatch}
                />
            )}

            {/* Lista de Mensajes */}
            <FlatList
                style={styles.messagesList}
                contentContainerStyle={[styles.messagesListContent, { flexDirection: 'column-reverse' }]}
                data={[...mensajes].reverse()}
                keyExtractor={(item) => item.id.toString()}
                inverted
                renderItem={({ item }) => (
                    <View style={[
                        styles.burbuja,
                        item.remitenteId === currentUserId ? styles.miMensaje : styles.otroMensaje
                    ]}>
                        <Text style={styles.textoMensaje}>{item.contenido}</Text>
                    </View>
                )}
            />

            {/* Contenedor del Input */}
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
                        {necesitaAceptar ? "Debes aceptar el match para responder" : "Esperando que acepten tu solicitud..."}
                    </Text>
                )}
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
);

}
const styles = StyleSheet.create({
    // Contenedor principal que ocupa toda la pantalla segura
    safeArea: {
        flex: 1,
        backgroundColor: '#121212',
    },
    // Contenedor que evita el teclado
    keyboardContainer: {
        flex: 1,
    },
    // Estilos de la lista de mensajes
    messagesList: {
        flex: 1,
        backgroundColor: '#121212', // Asegura que el fondo de la lista sea oscuro
    },
    messagesListContent: {
        paddingHorizontal: 10,
        paddingVertical: 5, // Un poco de padding vertical
    },
    // Estilos de las burbujas de chat (sin cambios)
    burbuja: { padding: 12, borderRadius: 18, marginVertical: 4, maxWidth: '75%' },
    miMensaje: { backgroundColor: colors.primaryAccent, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
    otroMensaje: { backgroundColor: '#333', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
    textoMensaje: { color: 'white', fontSize: 15 },
    // Estilos del input y botón (sin cambios)
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#1E1E1E', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333' },
    input: { flex: 1, backgroundColor: '#2C2C2C', color: 'white', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, fontSize: 16 },
    sendButton: { backgroundColor: colors.primaryAccent, padding: 10, borderRadius: 25 },
    textBloqueado: { color: '#888', textAlign: 'center', width: '100%', padding: 10, fontStyle: 'italic' },
    // Estilos para estados de carga y error (sin cambios)
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
});