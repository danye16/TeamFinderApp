import React, { useState, useContext, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { WebView } from 'react-native-webview';
// Asegúrate de que esta ruta sea correcta
import { fetchSteamUserData } from '../../constants/steam'; 

import { 
  View, 
  StyleSheet, 
  Alert, 
  Text, 
  TouchableOpacity,
  Keyboard,
  Modal,
  ActivityIndicator,
  Image // <--- IMPORTANTE: Añadido para el avatar
} from 'react-native';
import { AuthContext } from './AuthContext';

import FormInput from '../FormInput'; 
import FormButton from '../FormButton';
import FormSelect from '../FormSelect'; 
import { colors } from '@/constants/coloresVistaPrincipal';

interface RegisterScreenProps {
  onLoginPress: () => void;
}

const PAISES = [
  "México", "Argentina", "Chile", "Colombia", "España", 
  "Perú", "Estados Unidos", "Brasil", "Uruguay", "Otro"
];

const ESTILOS_JUEGO = [
  "Competitivo", "Casual", "Support", "Líder (IGL)", 
  "Aggressive (Entry)", "Estratega", "Solo Queue"
];

const EDADES = Array.from({ length: 87 }, (_, i) => (i + 13).toString());

// URL de retorno para engañar al WebView y cerrar el modal
const STEAM_RETURN_URL = 'https://example.com/auth/steam';

// URL para iniciar el flujo OpenID de Steam
const STEAM_LOGIN_URL = 'https://steamcommunity.com/openid/login' +
  '?openid.ns=http://specs.openid.net/auth/2.0' +
  '&openid.mode=checkid_setup' +
  `&openid.return_to=${STEAM_RETURN_URL}` + 
  `&openid.realm=${STEAM_RETURN_URL}` + 
  '&openid.identity=http://specs.openid.net/auth/2.0/identifier_select' + 
  '&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select';

const RegisterScreen = ({ onLoginPress }: RegisterScreenProps) => {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // --- ESTADOS PARA STEAM ---
  const [showSteamModal, setShowSteamModal] = useState(false);
  const [steamLoading, setSteamLoading] = useState(false);
  const [isSteamConnected, setIsSteamConnected] = useState(false); // ¿Ya se logueó?
  const [steamAvatar, setSteamAvatar] = useState(''); // URL del avatar

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const [form, setForm] = useState({
    username: '',
    contraseña: '',
    steamId: '',
    pais: '',
    edad: '',
    estiloJuego: ''
  });

  if (!auth) return null; 

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // --- LÓGICA DE STEAM ---

  const handleSteamLogin = () => {
    setShowSteamModal(true);
  };

  // Función para "olvidar" la cuenta de Steam si el usuario se arrepiente
  const handleDisconnectSteam = () => {
    setIsSteamConnected(false);
    setSteamAvatar('');
    setForm(prev => ({
        ...prev,
        username: '',
        contraseña: '',
        steamId: '',
        pais: '',
    }));
  };

  const handleWebViewNavigation = async (navState: any) => {
    const { url } = navState;

    // Usamos startsWith para detectar el regreso exacto
    if (url.startsWith('https://example.com') || url.startsWith('http://example.com')) {

      setShowSteamModal(false);
      setSteamLoading(true);

      const decodedUrl = decodeURIComponent(url);
      
      // Regex para encontrar el ID de 17 dígitos
      const regex = /(?:openid\/id\/|openid%2Fid%2F|steamid=)(\d{17})/;
      const match = decodedUrl.match(regex);

      if (match && match[1]) {
        const extractedSteamId = match[1];

        try {
          const steamData = await fetchSteamUserData(extractedSteamId);
          
          if (steamData) {
            // ¡Login Exitoso!
            setIsSteamConnected(true);
            setSteamAvatar(steamData.avatar);

            // Generamos contraseña aleatoria segura (el usuario entra con Steam, no necesita saberla)
            const randomPassword = Math.random().toString(36).slice(-8) + "Steam1!";

            setForm(prev => ({
              ...prev,
              steamId: steamData.steamId,
              username: steamData.personaname, // Llenamos el usuario con el de Steam
              pais: (steamData.pais && steamData.pais !== "Otro") ? steamData.pais : prev.pais,
              contraseña: randomPassword,
              
            }));

          }
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "Se obtuvo el ID pero fallaron los detalles del perfil.");
        } finally {
          setSteamLoading(false);
        }
      } else {
        setSteamLoading(false);
        Alert.alert("Error", "No se pudo validar la sesión de Steam.");
      }
    } 
  };

  // --- FIN LÓGICA STEAM ---

  const handleRegister = async () => {
    if (!form.username || !form.contraseña || !form.edad || !form.estiloJuego) {
      Alert.alert("Campos incompletos", "Por favor completa los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      console.error("Enviando datos:", form); 
      console.error("\n🔥 ============================= 🔥");
      console.error("📤 ENVIANDO AL BACKEND:");
      console.error(JSON.stringify(form, null, 2)); // Esto lo imprime bonito
      console.error("🔥 ============================= 🔥\n");
      await auth.register({
        ...form,
        edad: parseInt(form.edad) || 0 
      });
    } catch (error: any) {
      console.error("Error capturado:", error);
      let errorMessage = "Ocurrió un error inesperado";
      if (error instanceof Error) errorMessage = error.message;
      Alert.alert("Error de Registro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      
      {/* MODAL STEAM */}
      <Modal
        visible={showSteamModal}
        animationType="slide"
        onRequestClose={() => setShowSteamModal(false)}
      >
        <View style={{flex: 1, paddingTop: 40, backgroundColor: '#171a21'}}>
            <View style={styles.modalHeader}>
                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>Conectando con Steam...</Text>
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
                userAgent="Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            />
        </View>
      </Modal>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={30}
      >
        <Text style={styles.title}>ENCUENTRA TU SQUAD</Text>

        {/* --- ZONA DE CONEXIÓN STEAM --- */}
        
        {!isSteamConnected ? (
            // VISTA 1: BOTÓN PARA CONECTAR
            <>
                <TouchableOpacity 
                    style={styles.steamButton} 
                    onPress={handleSteamLogin}
                    disabled={steamLoading}
                >
                    {steamLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.steamButtonText}>🎮 Conectar con Steam</Text>
                    )}
                </TouchableOpacity>
                <Text style={styles.separatorText}>— O regístrate manualmente —</Text>
            </>
        ) : (
            // VISTA 2: TARJETA DE USUARIO CONECTADO
            <View style={styles.connectedCard}>
                <Image source={{ uri: steamAvatar }} style={styles.avatar} />
                <View style={styles.cardInfo}>
                    <Text style={styles.welcomeText}>¡CUENTA VINCULADA!</Text>
                    <Text style={styles.steamNameText} numberOfLines={1}>{form.username}</Text>
                </View>
                <TouchableOpacity onPress={handleDisconnectSteam} style={styles.disconnectBtn}>
                    <Text style={{color: '#ff4444', fontSize: 12, fontWeight: 'bold'}}>X</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* --- FORMULARIO --- */}

        {/* El usuario siempre puede ver/editar su nombre */}
        <FormInput
          placeholder="Usuario"
          value={form.username}
          onChangeText={(t: string) => handleChange('username', t)}
        />
        
        {/* Contraseña: SE OCULTA si está conectado (ya generamos una interna) */}
        {!isSteamConnected && (
            <FormInput
            placeholder="Contraseña"
            value={form.contraseña}
            onChangeText={(t: string) => handleChange('contraseña', t)}
            secureTextEntry
            />
        )}

        {/* SteamID: SE OCULTA si está conectado */}
        {!isSteamConnected && (
            <FormInput
            placeholder="Steam ID(opcional)"
            value={form.steamId}
            onChangeText={(t: string) => handleChange('steamId', t)}
            />
        )}

        {/* País: SE OCULTA si Steam nos dio el país automáticamente */}
        {(!isSteamConnected || !form.pais || form.pais === "Otro") && (
            <FormSelect 
            placeholder="Selecciona tu País"
            value={form.pais}
            options={PAISES}
            onSelect={(val) => handleChange('pais', val)}
            />
        )}

        {/* CAMPOS SIEMPRE VISIBLES (Edad y Estilo) */}
        <FormSelect 
          placeholder="Selecciona tu Edad"
          value={form.edad}
          options={EDADES}
          onSelect={(val) => handleChange('edad', val)}
        />

        <FormSelect 
          placeholder="Estilo de Juego"
          value={form.estiloJuego}
          options={ESTILOS_JUEGO}
          onSelect={(val) => handleChange('estiloJuego', val)}
        />

        <View style={styles.buttonContainer}>
          <FormButton 
            title={loading ? "Procesando..." : (isSteamConnected ? "Completar Registro" : "Registrarse")} 
            onPress={handleRegister} 
          />
        </View>

        <TouchableOpacity onPress={onLoginPress} style={styles.linkContainer}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta? <Text style={styles.linkText}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1, 
    backgroundColor: colors.primaryBackground,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.primaryText, 
    textTransform: 'uppercase',
  },
  // ESTILOS BOTÓN STEAM
  steamButton: {
    backgroundColor: '#171a21', 
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#66c0f4',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  steamButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // ESTILOS NUEVA TARJETA CONECTADO
  connectedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1b2838', // Fondo oscuro estilo Steam
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#66c0f4',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
      borderWidth: 1,
      borderColor: '#66c0f4'
  },
  cardInfo: {
      flex: 1,
  },
  welcomeText: {
      color: '#66c0f4',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1
  },
  steamNameText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
  },
  disconnectBtn: {
      padding: 10,
      backgroundColor: 'rgba(255, 68, 68, 0.1)',
      borderRadius: 20,
  },
  // FIN ESTILOS TARJETA
  separatorText: {
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 12,
    opacity: 0.7
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#171a21',
      borderBottomWidth: 1,
      borderBottomColor: '#333'
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  linkContainer: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  linkText: {
    color: colors.secondaryAccent,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;