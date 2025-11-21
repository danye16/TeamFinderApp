import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Game } from '@/components/api/steamApi';
import { colors } from '@/constants/coloresVistaPrincipal';

// Props del componente GameCard
interface GameCardProps {
  game: Game;
  onPress: (game: Game) => void;
}

// Formatea números grandes con comas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
// Componente GameCard
const GameCard = ({ game, onPress }: GameCardProps) => {
  const [modalVisible, setModalVisible] = useState(false);
// Renderizamos la tarjeta del juego
  return (
    <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
      {/* Imagen */}
      <Image 
        source={{ uri: game.coverUrl }} 
        style={styles.cover}
        resizeMode="cover"
      />

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{game.name}</Text>
        <Text style={styles.playerCount}>{formatNumber(game.playerCount)} jugadores</Text>
      </View>

      {/* Ícono de corazón fijo */}
      <View style={styles.iconContainer}>
        <Ionicons name="heart" size={22} color={colors.secondaryAccent} />
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{game.name}</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => {
                onPress(game);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Encontrar amigos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalClose} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};
// Estilos del componente
const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: colors.primaryAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cover: {
    width: '100%',
    height: 90,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  playerCount: {
    color: colors.secondaryText,
    fontSize: 12,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  // Modal estilos
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    width: 250,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryAccent,
  },
  modalTitle: {
    color: colors.secondaryAccent,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  modalButton: {
    backgroundColor: colors.primaryAccent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalClose: {
    marginTop: 8,
  },
  modalCloseText: {
    color: colors.secondaryText,
    fontSize: 14,
  },
});

export default GameCard;