import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FormButtonProps {
  title: string;
  onPress: () => void;
}

const FormButton = ({ title, onPress }: FormButtonProps) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    transform: [{ skewX: '-10deg' }],
  },
  button: {
    backgroundColor: '#FF3131',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    shadowColor: '#FF3131',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    transform: [{ skewX: '10deg' }],
    fontFamily: 'BebasNeue_400Regular',
  },
});

export default FormButton;