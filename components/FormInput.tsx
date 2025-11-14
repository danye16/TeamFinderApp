import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface FormInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

const FormInput = ({ placeholder, value, onChangeText, secureTextEntry, ...props }: FormInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#CCCCCC"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#252525',
    borderColor: '#FF3131',
    borderWidth: 2,
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default FormInput;