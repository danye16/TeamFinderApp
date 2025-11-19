import React, { useState, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Text, 
  TouchableOpacity,
  KeyboardAvoidingView, 
  Platform              
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

const RegisterScreen = ({ onLoginPress }: RegisterScreenProps) => {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    steamId: '',
    pais: '',
    edad: '',
    estiloJuego: ''
  });

  if (!auth) return null; 

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.edad || !form.pais || !form.estiloJuego) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos del formulario.");
      return;
    }

    setLoading(true);
    try {
      console.log("Enviando datos:", form); 
      await auth.register({
        ...form,
        edad: parseInt(form.edad) || 0 
      });
    } catch (error: any) {
      console.error("Error capturado:", error);
      
      let errorMessage = "Ocurrió un error inesperado";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else {
          try {
            const json = JSON.stringify(error, null, 2);
            if (json !== '{}') errorMessage = json;
          } catch (e) {
            errorMessage = "Error no legible";
          }
        }
      }

      if (errorMessage.includes('Network request failed')) {
        errorMessage += '\n\n(TIP: Revisa android:usesCleartextTraffic="true")';
      }

      Alert.alert("Error de Registro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      // En Android, a veces 'height' corta la vista exacto en el teclado.
      // 'padding' suele ser más seguro si tienes suficiente espacio abajo.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>ENCUENTRA TU SQUAD</Text>

        <FormInput
          placeholder="Usuario"
          value={form.username}
          onChangeText={(t: string) => handleChange('username', t)}
        />
        
        <FormInput
          placeholder="Contraseña"
          value={form.password}
          onChangeText={(t: string) => handleChange('password', t)}
          secureTextEntry
        />

        <FormInput
          placeholder="Steam ID"
          value={form.steamId}
          onChangeText={(t: string) => handleChange('steamId', t)}
        />

        <FormSelect 
          placeholder="Selecciona tu País"
          value={form.pais}
          options={PAISES}
          onSelect={(val) => handleChange('pais', val)}
        />

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
            title={loading ? "Creando cuenta..." : "Registrarse"} 
            onPress={handleRegister} 
          />
        </View>

        <TouchableOpacity onPress={onLoginPress} style={styles.linkContainer}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta? <Text style={styles.linkText}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // TRUCO: Aumentamos drásticamente el padding inferior (de 20 a 120).
    // Esto asegura que cuando el teclado suba, tengas espacio de sobra para scrollear
    // y el botón nunca quede atrapado o cortado en el borde.
    paddingBottom: 120, 
    justifyContent: 'center',
    flexGrow: 1, 
    backgroundColor: colors.primaryBackground,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: colors.primaryText, 
    textTransform: 'uppercase',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  linkContainer: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    // Ya no necesitamos margen extra aquí porque el paddingBottom del container lo maneja
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