import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/coloresVistaPrincipal';
import { AuthContext } from '@/components/Login/AuthContext';
// Importamos la nueva función y la interfaz
import { getGamesByUser, UserGame } from '@/components/services/userGame.service';

const OPCIONES_ESTILOS = ["Competitivo", "Casual", "Support", "Líder (IGL)",
  "Aggressive (Entry)", "Estratega", "Solo Queue" ];

export default function VistaSeleccion() {
    const { userInfo } = useContext(AuthContext)!;
    
    // Estado para los juegos cargados desde la API
    const [availableGames, setAvailableGames] = useState<UserGame[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado de la selección
    const [selectedSteamIds, setSelectedSteamIds] = useState<number[]>([]);
    const [estilo, setEstilo] = useState<string>("");

    // CARGAR JUEGOS AL MONTAR EL COMPONENTE
    useEffect(() => {
        const loadLibrary = async () => {
            if (userInfo?.id) {
                try {
                    const myGames = await getGamesByUser(userInfo.id);
                    setAvailableGames(myGames);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadLibrary();
    }, [userInfo]);

    // Lógica de selección (Usamos SteamAppId para el filtro)
    const toggleJuego = (steamId: number) => {
        if (selectedSteamIds.includes(steamId)) {
            setSelectedSteamIds(selectedSteamIds.filter(id => id !== steamId));
        } else {
            if (selectedSteamIds.length >= 3) {
                Alert.alert("Límite", "Máximo 3 juegos.");
                return;
            }
            setSelectedSteamIds([...selectedSteamIds, steamId]);
        }
    };

    const irAResultados = () => {
        if (selectedSteamIds.length === 0) {
            Alert.alert("Atención", "Selecciona al menos un juego de tu biblioteca.");
            return;
        }
        router.push({
            pathname: "/search/results",
            params: { ids: JSON.stringify(selectedSteamIds), estilo: estilo }
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primaryAccent} />
                <Text style={styles.loadingText}>Cargando tu biblioteca...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Selecciona de tu Biblioteca (Máx 3)</Text>
            
            {availableGames.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No tienes juegos registrados.</Text>
                    <Text style={styles.emptySubText}>Agrega juegos en el Inicio para buscar compañeros.</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {availableGames.map(game => (
                        <TouchableOpacity 
                            key={game.id} // Usamos ID único de BD para la lista
                            style={[
                                styles.btn, 
                                selectedSteamIds.includes(game.steamAppId) && styles.btnActive
                            ]}
                            onPress={() => toggleJuego(game.steamAppId)} // Usamos SteamID para la lógica
                        >
                            {/* Opcional: Mostrar imagen si tu API la devuelve */}
                            {/* <Image source={{ uri: game.imagenUrl }} style={{width: 30, height: 30, marginBottom: 5}} /> */}
                            
                            <Text 
                                style={[
                                    styles.txt, 
                                    selectedSteamIds.includes(game.steamAppId) && styles.txtActive
                                ]}
                                numberOfLines={2}
                            >
                                {game.nombre}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.label}>Estilo de Juego</Text>
            <View style={styles.grid}>
                {OPCIONES_ESTILOS.map(e => (
                    <TouchableOpacity 
                        key={e} 
                        style={[styles.btn, estilo === e && styles.btnActive]}
                        onPress={() => setEstilo(estilo === e ? "" : e)}
                    >
                        <Text style={[styles.txt, estilo === e && styles.txtActive]}>{e}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity 
                style={[styles.btnBuscar, availableGames.length === 0 && { opacity: 0.5 }]} 
                onPress={irAResultados}
                disabled={availableGames.length === 0}
            >
                <Text style={styles.txtBuscar}>BUSCAR COMPAÑEROS</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground, padding: 20 },
    label: { color: colors.secondaryAccent, fontSize: 16, marginBottom: 15, marginTop: 10, fontWeight: 'bold' },
    loadingText: { color: colors.secondaryText, marginTop: 10 },
    
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    
    btn: { 
        padding: 15, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        backgroundColor: colors.cardBackground, 
        width: '48%', // Dos columnas
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60
    },
    btnActive: { 
        backgroundColor: colors.primaryAccent, 
        borderColor: colors.primaryAccent 
    },
    
    txt: { color: '#aaa', textAlign: 'center', fontSize: 14 },
    txtActive: { color: '#fff', fontWeight: 'bold' },
    
    btnBuscar: { 
        marginTop: 40, 
        marginBottom: 30,
        backgroundColor: colors.secondaryAccent, 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center',
        elevation: 3
    },
    txtBuscar: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    emptyState: { padding: 20, alignItems: 'center', backgroundColor: '#252525', borderRadius: 10 },
    emptyText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    emptySubText: { color: '#aaa', textAlign: 'center', marginTop: 5 }
});