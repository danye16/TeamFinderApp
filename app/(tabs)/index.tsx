// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoginScreen from '../../components/LoginScreen';
import RegisterScreen from '../../components/RegisterScreen'; // Importa la nueva pantalla

export default function TabOneScreen() {
  // El estado ahora maneja qué pantalla mostrar
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  // Función para cambiar a la pantalla de registro
  const handleRegisterPress = () => {
    setCurrentScreen('register');
  };

  // Función para volver a la pantalla de login
  const handleLoginPress = () => {
    setCurrentScreen('login');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'login' ? (
        <LoginScreen onRegisterPress={handleRegisterPress} />
      ) : (
        <RegisterScreen onLoginPress={handleLoginPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
});