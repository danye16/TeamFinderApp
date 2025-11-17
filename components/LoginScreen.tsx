import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FormButton from './FormButton';
import FormInput from './FormInput';

interface LoginScreenProps {
  onRegisterPress: () => void;
}

const LoginScreen = ({ onRegisterPress }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.card}>
        <Text style={styles.title}>INICIAR SESIÓN</Text>
        
        <FormInput
          placeholder="GAMERTAG O EMAIL"
          value={email}
          onChangeText={setEmail}
        />
        <FormInput
          placeholder="CONTRASEÑA"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <FormButton title="ENTRAR" onPress={() => console.log('Login pressed')} />
        
        <TouchableOpacity style={styles.registerLink} onPress={onRegisterPress}>
          <Text style={styles.registerLinkText}>¿NO TIENES CUENTA? REGÍSTRATE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    padding: 30,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFD700',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  title: {
    fontSize: 40,
    color: '#FFD700',
    fontFamily: 'BebasNeue_400Regular',
    marginBottom: 30,
    textShadowColor: '#FF3131',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  registerLink: {
    marginTop: 20,
  },
  registerLinkText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'BebasNeue_400Regular',
  },
});

export default LoginScreen;