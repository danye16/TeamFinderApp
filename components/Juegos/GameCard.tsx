import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { Game } from '@/components/api/steamApi';
import { colors } from '@/constants/coloresVistaPrincipal';

interface GameCardProps {
  game: Game;
  onPress: (game: Game) => void;
  actionLabel?: string;
  hidePlayerCount?: boolean;
}

const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const GameCard = ({ game, onPress, hidePlayerCount, actionLabel = "BUSCAR COMPAÑEROS" }: GameCardProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
      <Image source={{ uri: game.coverUrl }} style={styles.cover} resizeMode="cover" />

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{game.name}</Text>
        {!hidePlayerCount && (
          <Text style={styles.playerCount}>{formatNumber(game.playerCount)} jugadores</Text>
        )}
      </View>

      {/* --- MODAL --- */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{game.name}</Text>
            
            {/* Este botón dispara la acción del padre (Registrar + Navegar) */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                onPress(game); 
              }}
            >
              
              <Text style={styles.modalButtonText}>{actionLabel}</Text>
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
  cover: { width: '100%', height: 90 },
  infoContainer: { padding: 12 },
  title: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  playerCount: { color: colors.secondaryText, fontSize: 12 },
  
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
    textAlign: 'center'
  },
  modalButton: {
    backgroundColor: colors.primaryAccent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center'
  },
  modalButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalClose: { marginTop: 8 },
  modalCloseText: { color: colors.secondaryText, fontSize: 14 },
});

export default GameCard;