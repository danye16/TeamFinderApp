// app/(tabs)/friends.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ListaChats from '@/components/Mensajes/ListaChats'; // Asegúrate de la ruta correcta
import { colors } from '@/constants/coloresVistaPrincipal';

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      {/* Cabecera visual opcional */}
      <View style={styles.topBar}>
        {/* Aquí podrías poner un título "Mis Squads" si quisieras */}
      </View>
      
      {/* El componente compuesto que maneja toda la lógica */}
      <ListaChats />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212' // Fondo oscuro general
  },
  topBar: {
    // Si quieres un espacio arriba o barra personalizada
  }
});