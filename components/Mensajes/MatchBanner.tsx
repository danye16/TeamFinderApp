// components/Mensajes/MatchBanner.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Usamos iconos
import { colors } from '@/constants/coloresVistaPrincipal'; // Ajusta si difiere

interface MatchBannerProps {
  esConfirmado: boolean;
  necesitaAceptar: boolean; 
  onAceptar: () => void;
  onRechazar: () => void; // Nueva prop
}

export const MatchBanner = ({ esConfirmado, necesitaAceptar, onAceptar, onRechazar }: MatchBannerProps) => {
  if (esConfirmado) return null; 

  return (
    <View style={styles.container}>
      {necesitaAceptar ? (
        <View style={styles.actionContainer}>
          <Text style={styles.text}>Solicitud de juego pendiente</Text>
          
          <View style={styles.buttonsRow}>
            {/* Botón Rechazar */}
            <TouchableOpacity style={[styles.iconButton, styles.rejectButton]} onPress={onRechazar}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Botón Aceptar */}
            <TouchableOpacity style={[styles.iconButton, styles.acceptButton]} onPress={onAceptar}>
              <Ionicons name="checkmark" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.waitingContainer}>
            <Ionicons name="time-outline" size={20} color="#aaa" style={{marginRight: 8}} />
            <Text style={styles.textInfo}>Esperando respuesta del usuario...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#1F1F1F',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    elevation: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { 
      color: 'white', 
      fontWeight: '600', 
      fontSize: 15,
      flex: 1 // Para que ocupe espacio y no empuje los botones fuera
  },
  textInfo: { color: '#aaa', fontStyle: 'italic' },
  
  buttonsRow: {
      flexDirection: 'row',
      gap: 15 // Espacio entre botones
  },
  iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 3,
  },
  acceptButton: {
      backgroundColor: '#4CAF50', // Verde
  },
  rejectButton: {
      backgroundColor: '#F44336', // Rojo
  }
});