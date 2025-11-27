import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import VistaResultados from '@/components/Filtros/VistaResultados';
import { colors } from '@/constants/coloresVistaPrincipal';

export default function ScreenResults() {
    const { ids, estilo } = useLocalSearchParams();
    
    // Convertimos los params al tipo correcto
    const idsArray = ids ? JSON.parse(ids as string) : [];
    const estiloStr = estilo as string || "";

    return (
        <>
            <Stack.Screen options={{ title: "Resultados", headerStyle: { backgroundColor: colors.primaryBackground }, headerTintColor: "white" }} />
            {/* Renderizamos el componente importado */}
            <VistaResultados idsJuegos={idsArray} estiloFiltro={estiloStr} />
        </>
    );
}