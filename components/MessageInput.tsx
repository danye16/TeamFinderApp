// components/MessageInput.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim().length > 0) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#CCCCCC"
        value={text}
        onChangeText={setText}
        multiline
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>ENVIAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FF3131',
  },
  sendButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    transform: [{ skewX: '-10deg' }],
  },
  sendButtonText: {
    color: '#0C0C0C',
    fontWeight: 'bold',
    fontFamily: 'BebasNeue_400Regular',
    transform: [{ skewX: '10deg' }],
  },
});

export default MessageInput;