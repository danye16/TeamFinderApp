import { colors } from '@/constants/coloresVistaPrincipal';
import React, { useContext, useState, useRef } from 'react'; // <--- 1. Agregamos useRef
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View,  } from 'react-native';
import { WebView } from 'react-native-webview';
import FormButton from '../FormButton';
import FormInput from '../FormInput';
import { AuthContext } from './AuthContext';

interface LoginScreenProps {
  onRegisterPress?: () => void;
}

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

  // Estados Steam
  const [showSteamModal, setShowSteamModal] = useState(false);
  const [steamLoading, setSteamLoading] = useState(false);
  
  // --- 2. CANDADO PARA EVITAR DOBLE LLAMADA ---
  // Esto evita que el WebView dispare el registro 2 veces seguidas
  const isProcessingSteam = useRef(false);

  // Estado visibilidad contraseña
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }
    setLoading(true);
    try {
      if (auth) await auth.login(username, password);
    } catch (error: any) {
      const msg = error.message || "Credenciales incorrectas";
      Alert.alert('Fallo de inicio de sesión', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSteamLoginPress = () => {
    // Reiniciamos el candado al abrir el modal
    isProcessingSteam.current = false; 
    setShowSteamModal(true);
  };

  const handleWebViewNavigation = async (navState: any) => {
    const { url } = navState;

    // Detectamos si estamos en la URL de retorno
    if (url.startsWith('https://example.com') || url.startsWith('http://example.com')) {
        
        // --- 3. BLOQUEO DE SEGURIDAD ---
        // Si ya estamos procesando un login, ignoramos cualquier evento extra del WebView
        if (isProcessingSteam.current) return;
        
        // Activamos el candado inmediatamente
        isProcessingSteam.current = true;

        setShowSteamModal(false);
        setSteamLoading(true); 

        const decodedUrl = decodeURIComponent(url);
        const regex = /(?:openid\/id\/|openid%2Fid%2F|steamid=)(\d{17})/;
        const match = decodedUrl.match(regex);

        if (match && match[1]) {
            const extractedSteamId = match[1];
            console.log("SteamID obtenido:", extractedSteamId);

            try {
                if (auth) {
                    await auth.loginOrRegisterWithSteam(extractedSteamId);
                }
            } catch (error: any) {
                console.error(error);
                Alert.alert("Error", "Hubo un problema al conectar con Steam. Inténtalo de nuevo.");
                // Si falló, liberamos el candado para que pueda reintentar
                isProcessingSteam.current = false; 
            } finally {
                setSteamLoading(false);
            }
        } else {
            // Si no se encontró ID, liberamos el candado
            setSteamLoading(false);
            isProcessingSteam.current = false;
        }
    }
  };

  return (
    <View style={styles.container}>
      
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
                incognito={true} 
                cacheEnabled={false} 
                thirdPartyCookiesEnabled={false}
            />
        </View>
      </Modal>

      <Text style={styles.title}>TEAM FINDER</Text>
      <Text style={styles.subtitle}>Inicia sesión o conéctate con Steam</Text>

      <View style={styles.form}>
        
        <TouchableOpacity 
            style={styles.steamButton} 
            onPress={handleSteamLoginPress}
            disabled={loading || steamLoading}
        >
            {(loading || steamLoading) ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.steamButtonText}>🎮 Continuar con Steam</Text>
            )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
        </View>

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
          secureTextEntry={!isPasswordVisible}
          rightIcon={isPasswordVisible ? 'eye-off' : 'eye'}
          onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
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