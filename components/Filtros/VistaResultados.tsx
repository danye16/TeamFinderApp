import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { AuthContext } from '@/components/Login/AuthContext';
import { obtenerJugadoresDeMultiplesJuegos, PlayerMatch } from '@/components/services/userGame.service';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // Importamos FontAwesome5 para el logo de Steam
import { colors } from '@/constants/coloresVistaPrincipal';

// Importamos el motor desde la misma carpeta
import { 
    FiltroCompuestoY, 
    FiltroEstilo, 
    FiltroExcluirPropio, 
    FiltroUsuarioUnico 
} from './MotorFiltros';

interface Props {
    idsJuegos: number[];
    estiloFiltro: string;
}

export default function VistaResultados({ idsJuegos, estiloFiltro }: Props) {
    const { userInfo } = useContext(AuthContext)!;
    const [jugadores, setJugadores] = useState<PlayerMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const procesar = async () => {
            try {
                const rawData = await obtenerJugadoresDeMultiplesJuegos(idsJuegos);

                const motor = new FiltroCompuestoY();
                motor.agregar(new FiltroUsuarioUnico());
                
                if (userInfo?.id) {
                    motor.agregar(new FiltroExcluirPropio(userInfo.id));
                }
                
                if (estiloFiltro) {
                    motor.agregar(new FiltroEstilo(estiloFiltro));
                }

                const final = motor.filtrar(rawData);
                setJugadores(final);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        procesar();
    }, [idsJuegos, estiloFiltro]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primaryAccent} />
                <Text style={styles.loadingText}>Buscando mejores candidatos...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: PlayerMatch }) => {
        // 1. Lógica de Avatar: Prioridad a la URL real, si no, generamos iniciales
        const avatarSource = item.usuarioAvatarUrl 
            ? { uri: item.usuarioAvatarUrl }
            : { uri: `https://ui-avatars.com/api/?name=${item.usuarioUsername}&background=random&color=fff&size=128` };

        return (
            <View style={styles.playerCard}>
                {/* --- FOTO DE PERFIL CON INSIGNIA --- */}
                <View style={styles.avatarContainer}>
                    <Image 
                        source={avatarSource} 
                        style={styles.avatarImage} 
                    />
                    {/* Si tiene SteamID, mostramos la insignia */}
                    {item.usuarioSteamId ? (
                        <View style={styles.steamBadge}>
                            <FontAwesome5 name="steam" size={10} color="white" />
                        </View>
                    ) : null}
                </View>
                
                <View style={styles.infoContainer}>
                    {/* ETIQUETA DEL JUEGO */}
                    <View style={styles.gameTagContainer}>
                        <Ionicons name="game-controller" size={10} color={colors.secondaryAccent} style={{marginRight: 4}}/>
                        <Text style={styles.gameTagName}>
                            {item.juegoNombre || "Juego Desconocido"}
                        </Text>
                    </View>

                    <Text style={styles.playerName}>{item.usuarioUsername}</Text>
                    
                    <View style={styles.tagsRow}>
                        <Text style={styles.playerStyle}>
                            {item.usuarioEstiloJuego || "Sin estilo"}
                        </Text>
                        {item.usuarioPais && (
                            <>
                                <Text style={styles.separator}>•</Text>
                                <Text style={styles.playerCountry}>{item.usuarioPais}</Text>
                            </>
                        )}
                    </View>
                </View>
                
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.secondaryText} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>CANDIDATOS</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{jugadores.length}</Text>
                </View>
            </View>

            <FlatList
                data={jugadores}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={60} color={colors.borderColor} />
                        <Text style={styles.emptyText}>No encontramos jugadores con esos criterios.</Text>
                        <Text style={styles.emptySubText}>Intenta cambiar el estilo de juego.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20,
        backgroundColor: '#121212' // Fondo oscuro consistente
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: colors.secondaryText, fontSize: 16 },
    
    listHeader: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 5
    },
    sectionTitle: { color: colors.secondaryAccent, fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    badge: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: colors.primaryText, fontWeight: 'bold', fontSize: 14 },

    playerCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.cardBackground, 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 12, 
        borderWidth: 1,
        borderColor: colors.borderColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    
    // --- ESTILOS DEL AVATAR ---
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25, // Circular
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: '#222' // Fondo mientras carga
    },
    steamBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#171a21', // Azul oscuro oficial de Steam
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000'
    },

    infoContainer: { flex: 1 },
    
    gameTagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4 // Un poco más de espacio
    },
    gameTagName: {
        color: colors.secondaryAccent, 
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },

    playerName: { color: '#fff', fontWeight: 'bold', fontSize: 17, marginBottom: 2 },
    tagsRow: { flexDirection: 'row', alignItems: 'center' },
    playerStyle: { color: '#aaa', fontSize: 13, fontWeight: '600' }, // Un gris más suave para el estilo
    separator: { color: '#555', marginHorizontal: 6 },
    playerCountry: { color: '#777', fontSize: 13 },

    emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.8 },
    emptyText: { color: colors.secondaryText, textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '500' },
    emptySubText: { color: '#666', marginTop: 8, fontSize: 14 }
});