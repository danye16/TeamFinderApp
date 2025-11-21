import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import UserProfile from '@/components/Usuario/UserProfile'; // Importamos el componente
import { colors } from '@/constants/coloresVistaPrincipal';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Solo renderizamos el componente completo */}
      <UserProfile />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.primaryBackground 
  }
});