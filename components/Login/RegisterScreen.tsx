import React, { useState, useContext, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { WebView } from 'react-native-webview';
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
  Image
} from 'react-native';
import { AuthContext } from './AuthContext';
import { Ionicons } from '@expo/vector-icons'; // <--- Importar Iconos

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

const STEAM_RETURN_URL = 'https://example.com/auth/steam';
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

  // Estados Steam
  const [showSteamModal, setShowSteamModal] = useState(false);
  const [steamLoading, setSteamLoading] = useState(false);
  const [isSteamConnected, setIsSteamConnected] = useState(false);
  const [steamAvatar, setSteamAvatar] = useState('');

  // NUEVO: Visibilidad de contraseña
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [form, setForm] = useState({
    username: '',
    contraseña: '',
    steamId: '',
    pais: '',
    edad: '',
    estiloJuego: ''
  });

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showListener.remove(); hideListener.remove(); };
  }, []);

  if (!auth) return null;

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // --- NUEVO: Validaciones de Contraseña ---
  const checkPasswordRequirements = (pass: string) => {
    return {
      length: pass.length >= 8,
      number: /\d/.test(pass),      // Tiene número
      uppercase: /[A-Z]/.test(pass),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass) // Tiene caracter especial
    };
  };

  const passwordValidations = checkPasswordRequirements(form.contraseña);
  const isPasswordValid = Object.values(passwordValidations).every(v => v);

  // --- LÓGICA DE STEAM ---
  const handleSteamLogin = () => setShowSteamModal(true);

  const handleDisconnectSteam = () => {
    setIsSteamConnected(false);
    setSteamAvatar('');
    setForm(prev => ({ ...prev, username: '', contraseña: '', steamId: '', pais: '' }));
  };

  const handleWebViewNavigation = async (navState: any) => {
    const { url } = navState;
    if (url.startsWith('https://example.com') || url.startsWith('http://example.com')) {
      setShowSteamModal(false);
      setSteamLoading(true);

      const decodedUrl = decodeURIComponent(url);
      const regex = /(?:openid\/id\/|openid%2Fid%2F|steamid=)(\d{17})/;
      const match = decodedUrl.match(regex);

      if (match && match[1]) {
        const extractedSteamId = match[1];
        try {
          const steamData = await fetchSteamUserData(extractedSteamId);
          if (steamData) {
            setIsSteamConnected(true);
            setSteamAvatar(steamData.avatar);

            // Generamos contraseña fuerte interna para usuario de Steam
            const randomPassword = Math.random().toString(36).slice(-8) + "Steam1!";

            setForm(prev => ({
              ...prev,
              steamId: steamData.steamId,
              username: steamData.personaname.replace(/[^a-zA-Z0-9]/g, "") || `User${steamData.steamId.slice(-6)}`,
              pais: (steamData.pais && steamData.pais !== "Otro") ? steamData.pais : prev.pais,
              contraseña: randomPassword,
            }));
          }
        } catch (error) {
          Alert.alert("Error", "Fallo al obtener datos de Steam.");
        } finally {
          setSteamLoading(false);
        }
      } else {
        setSteamLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    if (!form.username || !form.contraseña || !form.edad || !form.estiloJuego) {
      Alert.alert("Campos incompletos", "Por favor completa los campos obligatorios.");
      return;
    }

    // VALIDACIÓN IMPORTANTE:
    // Si NO es usuario de Steam, validamos que la contraseña sea segura.
    if (!isSteamConnected && !isPasswordValid) {
      Alert.alert("Contraseña Insegura", "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
      return;
    }

    setLoading(true);
    try {
      await auth.register({
        ...form,
        edad: parseInt(form.edad) || 0
      });
    } catch (error: any) {
      let errorMessage = "Ocurrió un error inesperado";
      if (error instanceof Error) errorMessage = error.message;
      Alert.alert("Error de Registro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>

      <Modal visible={showSteamModal} animationType="slide" onRequestClose={() => setShowSteamModal(false)}>
        <View style={{ flex: 1, paddingTop: 40, backgroundColor: '#171a21' }}>
          <View style={styles.modalHeader}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Conectando con Steam...</Text>
            <TouchableOpacity onPress={() => setShowSteamModal(false)}>
              <Text style={{ color: '#ff4444', fontSize: 16 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: STEAM_LOGIN_URL }}
            onNavigationStateChange={handleWebViewNavigation}
            incognito={true} cacheEnabled={false} thirdPartyCookiesEnabled={false}
          />
        </View>
      </Modal>

      <KeyboardAwareScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} enableOnAndroid={true} extraScrollHeight={30}>
        <Text style={styles.title}>ENCUENTRA TU SQUAD</Text>

        {!isSteamConnected ? (
          <>
            <TouchableOpacity style={styles.steamButton} onPress={handleSteamLogin} disabled={steamLoading}>
              {steamLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.steamButtonText}>🎮 Conectar con Steam</Text>}
            </TouchableOpacity>
            <Text style={styles.separatorText}>— O regístrate manualmente —</Text>
          </>
        ) : (
          <View style={styles.connectedCard}>
            <Image source={{ uri: steamAvatar }} style={styles.avatar} />
            <View style={styles.cardInfo}>
              <Text style={styles.welcomeText}>¡CUENTA VINCULADA!</Text>
              <Text style={styles.steamNameText} numberOfLines={1}>{form.username}</Text>
            </View>
            <TouchableOpacity onPress={handleDisconnectSteam} style={styles.disconnectBtn}>
              <Text style={{ color: '#ff4444', fontSize: 12, fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        <FormInput
          placeholder="Usuario"
          value={form.username}
          onChangeText={(t: string) => handleChange('username', t)}
        />

        {/* --- INPUT CONTRASEÑA MEJORADO --- */}
        {!isSteamConnected && (
          <View>
            <FormInput
              placeholder="Contraseña"
              value={form.contraseña}
              onChangeText={(t: string) => handleChange('contraseña', t)}
              // Lógica del Ojito
              secureTextEntry={!isPasswordVisible}
              rightIcon={isPasswordVisible ? 'eye-off' : 'eye'}
              onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            {/* Indicadores de requisitos (solo si empezó a escribir) */}
            {form.contraseña.length > 0 && (
              <View style={styles.requirementsContainer}>
                <RequirementItem valid={passwordValidations.length} text="Mín. 8 caracteres" />
                <RequirementItem valid={passwordValidations.number} text="Al menos 1 número" />
                <RequirementItem valid={passwordValidations.uppercase} text="Al menos 1 mayúscula" />
                <RequirementItem valid={passwordValidations.specialChar} text="Al menos 1 caracter especial" />
              </View>
            )}
          </View>
        )}

        {!isSteamConnected && (
          <FormInput
            placeholder="Steam ID (Opcional)"
            value={form.steamId}
            onChangeText={(t: string) => handleChange('steamId', t)}
          />
        )}

        {(!isSteamConnected || !form.pais || form.pais === "Otro") && (
          <FormSelect
            placeholder="Selecciona tu País"
            value={form.pais}
            options={PAISES}
            onSelect={(val) => handleChange('pais', val)}
          />
        )}

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

// --- Componente Pequeño para los Checks ---
const RequirementItem = ({ valid, text }: { valid: boolean, text: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
    <Ionicons
      name={valid ? "checkmark-circle" : "ellipse-outline"}
      size={14}
      color={valid ? "#4CAF50" : "#666"}
    />
    <Text style={{ marginLeft: 5, color: valid ? "#4CAF50" : "#666", fontSize: 12 }}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center', flexGrow: 1, backgroundColor: colors.primaryBackground },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.primaryText, textTransform: 'uppercase' },
  steamButton: { backgroundColor: '#171a21', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#66c0f4', flexDirection: 'row', justifyContent: 'center' },
  steamButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  connectedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1b2838', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#66c0f4' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, borderWidth: 1, borderColor: '#66c0f4' },
  cardInfo: { flex: 1 },
  welcomeText: { color: '#66c0f4', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  steamNameText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disconnectBtn: { padding: 10, backgroundColor: 'rgba(255, 68, 68, 0.1)', borderRadius: 20 },
  separatorText: { color: colors.secondaryText, textAlign: 'center', marginBottom: 15, fontSize: 12, opacity: 0.7 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#171a21', borderBottomWidth: 1, borderBottomColor: '#333' },
  buttonContainer: { marginTop: 20, marginBottom: 10 },
  linkContainer: { marginTop: 20, padding: 10, alignItems: 'center' },
  footerText: { color: colors.secondaryText, fontSize: 14 },
  linkText: { color: colors.secondaryAccent, fontWeight: 'bold' },
  // Estilo contenedor de requisitos
  requirementsContainer: {
    marginTop: -5,
    marginBottom: 15,
    marginLeft: 5
  }
});

export default RegisterScreen;