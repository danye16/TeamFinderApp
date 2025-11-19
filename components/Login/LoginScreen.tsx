// components/Login/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import { View, StyleSheet, Text, Alert, Image } from 'react-native';
import { AuthContext } from './AuthContext';
import FormInput from '../FormInput'; 
import FormButton from '../FormButton';
import { colors } from '@/constants/coloresVistaPrincipal'; // Para mantener el tema

// Prop para navegar al registro (se pasa desde el index)
interface LoginScreenProps {
  onRegisterPress?: () => void;
}

const LoginScreen = ({ onRegisterPress }: LoginScreenProps) => {
  const auth = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      // Llamamos a la lógica del Contexto
      if (auth) {
        await auth.login(username, password);
      }
    } catch (error: any) {
      Alert.alert('Fallo de inicio de sesión', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TEAM FINDER</Text>
      <Text style={styles.subtitle}>Inicia sesión para encontrar equipo</Text>

      <View style={styles.form}>
        <FormInput
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <FormInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
            <FormButton 
              title={loading ? "Cargando..." : "Iniciar Sesión"} 
              onPress={handleLogin} 
            />
        </View>

        <Text style={styles.footerText}>
          ¿No tienes cuenta?{' '}
          <Text style={styles.link} onPress={onRegisterPress}>
            Regístrate aquí
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primaryAccent,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: colors.secondaryAccent,
    fontWeight: 'bold',
  },
});

export default LoginScreen;