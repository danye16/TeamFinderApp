import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/coloresVistaPrincipal';

interface FormSelectProps {
  placeholder: string;
  value: string; // El valor seleccionado actualmente
  options: string[]; // La lista de opciones a mostrar
  onSelect: (value: string) => void; // Función al seleccionar
}

const FormSelect = ({ placeholder, value, options, onSelect }: FormSelectProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (item: string) => {
    onSelect(item);
    setModalVisible(false);
  };

  return (
    <View>
      {/* El "Input" falso que abre el modal */}
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.secondaryText} />
      </TouchableOpacity>

      {/* El Modal con la lista */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona {placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem} 
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.optionText, 
                    item === value && styles.selectedOptionText
                  ]}>
                    {item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark" size={20} color={colors.secondaryAccent} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Estilos similares a un Input normal para consistencia
  inputContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    height: 50, // Altura estándar de inputs
    borderColor: colors.primaryAccent, // Usando tus colores
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: colors.cardBackground || '#333', 
  },
  inputText: {
    fontSize: 16,
    color: colors.primaryText || '#fff',
  },
  placeholderText: {
    color: colors.secondaryText || '#aaa',
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.primaryBackground,
    borderRadius: 12,
    maxHeight: '60%', // Para que no ocupe toda la pantalla
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primaryAccent,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondaryAccent,
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: colors.primaryText,
  },
  selectedOptionText: {
    color: colors.secondaryAccent,
    fontWeight: 'bold',
  },
});

export default FormSelect;