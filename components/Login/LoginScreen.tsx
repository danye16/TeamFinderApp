import React, { useState, useContext } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview'; // <--- NO OLVIDAR
import { AuthContext } from './AuthContext';
import FormInput from '../FormInput'; 
import FormButton from '../FormButton';
import { colors } from '@/constants/coloresVistaPrincipal';

// Importamos helper de Steam (el mismo que usas en Registro)
import { fetchSteamUserData } from '../../constants/steam'; 

interface LoginScreenProps {
  onRegisterPress?: () => void;
}

// Constantes para el WebView (Mismas que en Registro)
const STEAM_RETURN_URL = 'https://example.com/auth/steam';
const STEAM_LOGIN_URL = 'https://steamcommunity.com/openid/login' +
  '?openid.ns=http://specs.openid.net/auth/2.0' +
  '&openid.mode=checkid_setup' +
  `&openid.return_to=${STEAM_RETURN_URL}` + 
  `&openid.realm=${STEAM_RETURN_URL}` + 
  '&openid.identity=http://specs.openid.net/auth/2.0/identifier_select' + 
  '&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select';

const LoginScreen = ({ onRegisterPress }: LoginScreenProps) => {
  const auth = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS STEAM ---
  const [showSteamModal, setShowSteamModal] = useState(false);
  const [steamLoading, setSteamLoading] = useState(false);

  // Login Normal (Usuario/Pass)
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }
    setLoading(true);
    try {
      if (auth) await auth.login(username, password);
    } catch (error: any) {
      Alert.alert('Fallo de inicio de sesión', "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGICA STEAM LOGIN ---
  const handleSteamLoginPress = () => {
    setShowSteamModal(true);
  };

  const handleWebViewNavigation = async (navState: any) => {
  const { url } = navState;

  // Detectamos el retorno
  if (url.startsWith('https://example.com') || url.startsWith('http://example.com')) {
    setShowSteamModal(false);
    setSteamLoading(true);

    const decodedUrl = decodeURIComponent(url);
    const regex = /(?:openid\/id\/|openid%2Fid%2F|steamid=)(\d{17})/;
    const match = decodedUrl.match(regex);

    if (match && match[1]) {
      const extractedSteamId = match[1];
      console.log("Intentando Login con SteamID:", extractedSteamId);

      try {
        if (auth) {
          await auth.loginSteam(extractedSteamId);
        }
      } catch (error: any) {
        console.error(error);
        let errorMessage = "No se pudo iniciar sesión con Steam. Por favor, inténtalo de nuevo.";
        
        if (error.message) {
          if (error.message.includes('Respuesta vacía del servidor')) {
            errorMessage = "El servidor no respondió correctamente. Por favor, inténtalo de nuevo más tarde.";
          } else if (error.message.includes('No es un JSON válido')) {
            errorMessage = "Error al procesar la respuesta del servidor. Por favor, inténtalo de nuevo.";
          } else if (error.message.includes('No encontramos una cuenta')) {
            errorMessage = "No encontramos una cuenta vinculada a este Steam ID. Por favor regístrate primero.";
          } else {
            errorMessage = error.message;
          }
        }
        
        Alert.alert("Error de inicio de sesión", errorMessage);
      } finally {
        setSteamLoading(false);
      }
    } else {
      setSteamLoading(false);
      Alert.alert("Error", "No se pudo validar la sesión de Steam.");
    }
  }
};

  return (
    <View style={styles.container}>
      
      {/* MODAL DE STEAM */}
      <Modal visible={showSteamModal} animationType="slide" onRequestClose={() => setShowSteamModal(false)}>
        <View style={{flex: 1, paddingTop: 40, backgroundColor: '#171a21'}}>
            <View style={styles.modalHeader}>
                <Text style={{color: 'white', fontSize: 18}}>Iniciando sesión...</Text>
                <TouchableOpacity onPress={() => setShowSteamModal(false)}>
                    <Text style={{color: '#ff4444', fontSize: 16}}>Cancelar</Text>
                </TouchableOpacity>
            </View>
            <WebView 
                source={{ uri: STEAM_LOGIN_URL }}
                onNavigationStateChange={handleWebViewNavigation}
                incognito={true} cacheEnabled={false} thirdPartyCookiesEnabled={false}
            />
        </View>
      </Modal>

      <Text style={styles.title}>TEAM FINDER</Text>
      <Text style={styles.subtitle}>Inicia sesión para encontrar equipo</Text>

      <View style={styles.form}>
        
        {/* BOTÓN DE STEAM LOGIN */}
        <TouchableOpacity 
            style={styles.steamButton} 
            onPress={handleSteamLoginPress}
            disabled={loading || steamLoading}
        >
            {(loading || steamLoading) ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.steamButtonText}>🎮 Iniciar con Steam</Text>
            )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
        </View>

        {/* LOGIN NORMAL */}
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
    marginBottom: 30,
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
  // Estilos para Steam y Divisor
  steamButton: {
    backgroundColor: '#171a21',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#66c0f4',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  steamButtonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16
  },
  dividerContainer: {
      flexDirection: 'row', alignItems: 'center', marginBottom: 20
  },
  dividerLine: {
      flex: 1, height: 1, backgroundColor: colors.secondaryText, opacity: 0.3
  },
  dividerText: {
      marginHorizontal: 10, color: colors.secondaryText
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#171a21'
  }
});

export default LoginScreen;