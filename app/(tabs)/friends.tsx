import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/coloresVistaPrincipal';

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AMIGOS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBackground, justifyContent: 'center', alignItems: 'center' },
  text: { color: 'white', fontSize: 20, fontWeight: 'bold' }
});