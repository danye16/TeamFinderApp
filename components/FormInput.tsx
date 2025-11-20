import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // <--- 1. IMPORTAR ICONOS

interface FormInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  // --- 2. NUEVAS PROPS ---
  rightIcon?: keyof typeof Ionicons.glyphMap; // Nombre del icono (ej: 'eye')
  onRightIconPress?: () => void;              // Función al tocarlo
}

const FormInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  rightIcon,        // <--- Extraer prop
  onRightIconPress, // <--- Extraer prop
  ...props 
}: FormInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#CCCCCC"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      
      {/* --- 3. RENDERIZAR EL ICONO SI EXISTE --- */}
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
          <Ionicons name={rightIcon} size={24} color="#CCCCCC" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#252525',
    borderColor: '#FF3131',
    borderWidth: 2,
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
    // --- 4. CAMBIO CLAVE EN ESTILOS ---
    flexDirection: 'row', // Para poner texto e icono lado a lado
    alignItems: 'center', // Centrar verticalmente
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1, // <--- IMPORTANTE: Ocupar todo el ancho disponible menos el icono
  },
  iconButton: {
    padding: 10, // Espacio para que sea fácil de tocar
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default FormInput;