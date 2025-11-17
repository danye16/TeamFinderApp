// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChatScreen from '../../components/ChatScreen'; // Importa la pantalla de chat
import LoginScreen from '../../components/LoginScreen';
import RegisterScreen from '../../components/RegisterScreen';

export default function TabOneScreen() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'chat'>('login');

  const handleRegisterPress = () => {
    setCurrentScreen('register');
  };

  const handleLoginPress = () => {
    setCurrentScreen('login');
  };
  
  const handleGoToChat = () => {
    setCurrentScreen('chat');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'login' ? (
        <LoginScreen onRegisterPress={handleRegisterPress} />
      ) : currentScreen === 'register' ? (
        <RegisterScreen onLoginPress={handleLoginPress} />
      ) : (
        <ChatScreen />
      )}
      
      {currentScreen !== 'chat' && (
        <TouchableOpacity style={styles.goToChatButton} onPress={handleGoToChat}>
            <Text style={styles.goToChatText}>PROBAR CHAT</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0C0C0C',
      justifyContent: 'center',
    },
    goToChatButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: '#FFD700',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FF3131',
    },
    goToChatText: {
        color: '#0C0C0C',
        fontFamily: 'BebasNeue_400Regular',
        fontSize: 16,
    },
});