import React, { useState, useContext, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { AuthContext } from './AuthContext';
import { Ionicons } from '@expo/vector-icons';

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Estado Visibilidad contraseña
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [form, setForm] = useState({
    username: '',
    contraseña: '',
    steamId: '', // Opcional para registro manual
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

  // Validaciones de Contraseña
  const checkPasswordRequirements = (pass: string) => {
    return {
      length: pass.length >= 8,
      number: /\d/.test(pass),
      uppercase: /[A-Z]/.test(pass),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };
  };

  const passwordValidations = checkPasswordRequirements(form.contraseña);
  const isPasswordValid = Object.values(passwordValidations).every(v => v);

  const handleRegister = async () => {
    if (!form.username || !form.contraseña || !form.edad || !form.estiloJuego) {
      Alert.alert("Campos incompletos", "Por favor completa los campos obligatorios.");
      return;
    }

    if (!isPasswordValid) {
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
      <KeyboardAwareScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} enableOnAndroid={true} extraScrollHeight={30}>
        <Text style={styles.title}>REGISTRARSE</Text>

        <FormInput
          placeholder="Usuario"
          value={form.username}
          onChangeText={(t: string) => handleChange('username', t)}
        />

        <View>
          <FormInput
            placeholder="Contraseña"
            value={form.contraseña}
            onChangeText={(t: string) => handleChange('contraseña', t)}
            secureTextEntry={!isPasswordVisible}
            rightIcon={isPasswordVisible ? 'eye-off' : 'eye'}
            onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />

          {form.contraseña.length > 0 && (
            <View style={styles.requirementsContainer}>
              <RequirementItem valid={passwordValidations.length} text="Mín. 8 caracteres" />
              <RequirementItem valid={passwordValidations.number} text="Al menos 1 número" />
              <RequirementItem valid={passwordValidations.uppercase} text="Al menos 1 mayúscula" />
              <RequirementItem valid={passwordValidations.specialChar} text="Al menos 1 caracter especial" />
            </View>
          )}
        </View>

        <FormInput
          placeholder="Steam ID (Opcional)"
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
            title={loading ? "Procesando..." : "Registrarse"}
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
  buttonContainer: { marginTop: 20, marginBottom: 10 },
  linkContainer: { marginTop: 20, padding: 10, alignItems: 'center' },
  footerText: { color: colors.secondaryText, fontSize: 14 },
  linkText: { color: colors.secondaryAccent, fontWeight: 'bold' },
  requirementsContainer: {
    marginTop: -5,
    marginBottom: 15,
    marginLeft: 5
  }
});

export default RegisterScreen;