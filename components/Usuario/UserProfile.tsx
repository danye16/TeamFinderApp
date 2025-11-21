import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  Alert, 
  Modal,
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview'; // <--- 1. IMPORTANTE

// Componentes Reutilizables
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormButton from '@/components/FormButton';

// Lógica y Constantes
import { AuthContext } from '@/components/Login/AuthContext';
import { getUserById, updateUser } from '@/components/services/auth.service';
import { fetchSteamUserData } from '@/constants/steam';
import { colors } from '@/constants/coloresVistaPrincipal';

const PAISES = ["México", "Argentina", "Chile", "Colombia", "España", "Perú", "Estados Unidos", "Brasil", "Uruguay", "Otro"];
const ESTILOS_JUEGO = ["Competitivo", "Casual", "Support", "Líder (IGL)", "Aggressive (Entry)", "Estratega", "Solo Queue"];
const EDADES = Array.from({ length: 87 }, (_, i) => (i + 13).toString());

// --- CONSTANTES STEAM ---
const STEAM_RETURN_URL = 'https://example.com/auth/steam';
const STEAM_LOGIN_URL = 'https://steamcommunity.com/openid/login' +
  '?openid.ns=http://specs.openid.net/auth/2.0' +
  '&openid.mode=checkid_setup' +
  `&openid.return_to=${STEAM_RETURN_URL}` +
  `&openid.realm=${STEAM_RETURN_URL}` +
  '&openid.identity=http://specs.openid.net/auth/2.0/identifier_select' +
  '&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select';



  const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
export default function UserProfile() {
  const { userInfo } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado para Modal de Steam
  const [showSteamModal, setShowSteamModal] = useState(false);

const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [form, setForm] = useState({
    username: '',
    pais: '',
    edad: '',
    estiloJuego: '',
    steamId: '',
    password: '',
  });

  // 1. CARGAR DATOS
 useEffect(() => {
    const loadProfile = async () => {
      if (!userInfo?.id) return;
      
      try {
        const userData = await getUserById(userInfo.id);
        
        setForm({
          username: userData.username || '',
          pais: userData.pais || '',
          edad: userData.edad ? userData.edad.toString() : '',
          estiloJuego: userData.estiloJuego || '',
          steamId: userData.steamId || '', // Si viene null, lo pone como string vacía
          password: ''
        });

        // LOGICA CORREGIDA PARA IMAGEN
        if (userData.steamId && userData.steamId !== "") {
          // Si hay ID, buscamos en Steam
          const steamProfile = await fetchSteamUserData(userData.steamId);
          if (steamProfile?.avatar) {
            setAvatarUrl(steamProfile.avatar);
          } else {
            setAvatarUrl(DEFAULT_AVATAR);
          }
        } else {
          // Si NO hay ID (es cadena vacía), ponemos la genérica
          setAvatarUrl(DEFAULT_AVATAR);
        }

      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userInfo]);

  // Helper para actualizar foto
  const updateAvatarFromSteam = async (steamId: string) => {
    try {
      const steamProfile = await fetchSteamUserData(steamId);
      if (steamProfile?.avatar) {
        setAvatarUrl(steamProfile.avatar);
      }
    } catch (e) {
      console.log("Error cargando avatar steam", e);
    }
  };

  // 2. MANEJAR VINCULACIÓN DE STEAM (WebView)
  const handleSteamNavigation = async (navState: any) => {
    const { url } = navState;
    if (url.startsWith('https://example.com') || url.startsWith('http://example.com')) {
      setShowSteamModal(false); // Cerramos modal inmediatamente

      const decodedUrl = decodeURIComponent(url);
      const regex = /(?:openid\/id\/|openid%2Fid%2F|steamid=)(\d{17})/;
      const match = decodedUrl.match(regex);

      if (match && match[1]) {
        const newSteamId = match[1];
        console.log("Steam ID Vinculado:", newSteamId);
        
        // Actualizamos el formulario local
        handleChange('steamId', newSteamId);
        
        // Actualizamos la foto visualmente
        await updateAvatarFromSteam(newSteamId);
        
        Alert.alert("¡Steam Conectado!", "Recuerda presionar 'GUARDAR CAMBIOS' para confirmar la vinculación.");
      }
    }
  };

  // 3. GUARDAR CAMBIOS
  const handleSave = async () => {
    if (!userInfo?.id) return;
    setSaving(true);

    try {
      const payload = {
        username: form.username,
        steamId: form.steamId,
        pais: form.pais,
        edad: parseInt(form.edad) || 18,
        estiloJuego: form.estiloJuego,
        nuevaContraseña: form.password
      };

      await updateUser(userInfo.id, payload);
      Alert.alert("¡Éxito!", "Tu perfil ha sido actualizado correctamente.");
      setForm(prev => ({ ...prev, password: '' }));

    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  const isProfileIncomplete = !form.edad || !form.estiloJuego || form.estiloJuego === "Casual"; 

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* --- MODAL DE STEAM --- */}
      <Modal visible={showSteamModal} animationType="slide" onRequestClose={() => setShowSteamModal(false)}>
        <View style={{flex: 1, paddingTop: 40, backgroundColor: '#171a21'}}>
            <View style={styles.modalHeader}>
                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>Conectando Steam...</Text>
                <TouchableOpacity onPress={() => setShowSteamModal(false)}>
                    <Text style={{color: '#ff4444', fontSize: 16}}>Cancelar</Text>
                </TouchableOpacity>
            </View>
            <WebView 
                source={{ uri: STEAM_LOGIN_URL }}
                onNavigationStateChange={handleSteamNavigation}
                incognito={true} 
            />
        </View>
      </Modal>

      {/* --- SECCIÓN 1: CABECERA --- */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        
        {/* Badge condicional */}
        {form.steamId ? (
          <View style={styles.steamBadge}>
            <Ionicons name="logo-steam" size={16} color="#fff" />
            <Text style={styles.steamText}>Verificado</Text>
          </View>
        ) : (
          <View style={[styles.steamBadge, { borderColor: '#555', backgroundColor: '#333' }]}>
             <Text style={[styles.steamText, { color: '#aaa' }]}>Cuenta Local</Text>
          </View>
        )}
        
        <Text style={styles.usernameTitle}>{form.username}</Text>
      </View>

      {/* --- SECCIÓN 2: ADVERTENCIA --- */}
      {isProfileIncomplete && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color="#FFD700" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.warningTitle}>PERFIL INCOMPLETO</Text>
            <Text style={styles.warningText}>
              Completa tu edad y estilo de juego para aparecer en el matchmaking.
            </Text>
          </View>
        </View>
      )}

      {/* --- SECCIÓN 3: FORMULARIO --- */}
      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>INFORMACIÓN PÚBLICA</Text>
        
        <FormInput
          placeholder="Nombre de Usuario"
          value={form.username}
          onChangeText={(t) => handleChange('username', t)}
        />

        <FormSelect
          placeholder="País"
          value={form.pais}
          options={PAISES}
          onSelect={(val) => handleChange('pais', val)}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <FormSelect
              placeholder="Edad"
              value={form.edad}
              options={EDADES}
              onSelect={(val) => handleChange('edad', val)}
            />
          </View>
          <View style={{ width: '48%' }}>
            <FormSelect
              placeholder="Estilo de Juego"
              value={form.estiloJuego}
              options={ESTILOS_JUEGO}
              onSelect={(val) => handleChange('estiloJuego', val)}
            />
          </View>
        </View>

        {/* --- SECCIÓN STEAM --- */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>CONEXIONES</Text>
        
        {!form.steamId ? (
          // CASO A: NO VINCULADO -> MOSTRAR BOTÓN
          <TouchableOpacity style={styles.connectSteamBtn} onPress={() => setShowSteamModal(true)}>
            <Ionicons name="logo-steam" size={24} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.connectSteamText}>VINCULAR CUENTA DE STEAM</Text>
          </TouchableOpacity>
        ) : (
          // CASO B: VINCULADO -> MOSTRAR INPUT SOLO LECTURA
          <View style={{ opacity: 0.6 }}>
            <Text style={styles.helperText}>Cuenta vinculada correctamente.</Text>
            <FormInput
              placeholder="Steam ID"
              value={form.steamId}
              onChangeText={() => {}}
              editable={false}
              rightIcon="checkmark-circle" // Un check verde visual
            />
          </View>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>SEGURIDAD</Text>
        <Text style={styles.helperText}>Deja esto vacío si no quieres cambiar tu contraseña.</Text>
        
        <FormInput
          placeholder="Nueva Contraseña (Opcional)"
          value={form.password}
          onChangeText={(t) => handleChange('password', t)}
          secureTextEntry
        />

        <View style={{ marginTop: 20 }}>
          <FormButton 
            title={saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"} 
            onPress={handleSave} 
          />
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBackground },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryBackground },
  
  headerContainer: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.primaryAccent },
  usernameTitle: { fontSize: 24, fontWeight: 'bold', color: colors.primaryText, marginTop: 10, textTransform: 'uppercase' },
  
  steamBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#171a21', 
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: -15, marginBottom: 5, borderWidth: 1, borderColor: '#66c0f4'
  },
  steamText: { color: '#66c0f4', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },

  warningCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.15)', 
    marginHorizontal: 20, marginBottom: 15, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700'
  },
  warningTitle: { color: '#FFD700', fontWeight: 'bold', marginBottom: 2 },
  warningText: { color: '#DDD', fontSize: 12 },

  formSection: { paddingHorizontal: 20 },
  sectionLabel: { color: colors.secondaryAccent, fontWeight: 'bold', marginBottom: 5, marginTop: 10, fontSize: 12, textTransform: 'uppercase' },
  helperText: { color: colors.secondaryText, fontSize: 11, marginBottom: 5, fontStyle: 'italic' },

  // Estilos Botón Conectar Steam
  connectSteamBtn: {
    flexDirection: 'row',
    backgroundColor: '#171a21', // Color Steam
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#66c0f4',
    marginBottom: 10
  },
  connectSteamText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase'
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#171a21', borderBottomWidth: 1, borderBottomColor: '#333'
  },
});