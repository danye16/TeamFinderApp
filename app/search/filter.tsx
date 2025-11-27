import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router'; // <--- Importante
import VistaSeleccion from '@/components/Filtros/VistaSeleccion';
import { colors } from '@/constants/coloresVistaPrincipal';

export default function ScreenFilter() {
    return (
        <View style={{ flex: 1, backgroundColor: colors.primaryBackground }}>
            {/* CONFIGURACIÓN DEL HEADER DE ESTA PANTALLA */}
            <Stack.Screen 
                options={{ 
                    title: "Configurar Filtros", // Título amigable
                    headerStyle: { backgroundColor: colors.primaryBackground }, // Fondo oscuro
                    headerTintColor: colors.primaryText, // Texto blanco (flecha atrás y título)
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerShadowVisible: false, // Quita la sombra fea de Android/iOS
                    //headerBackTitleVisible: false, // Oculta texto "Atrás" en iOS
                }} 
            />
            
            <VistaSeleccion />
        </View>
    );
}