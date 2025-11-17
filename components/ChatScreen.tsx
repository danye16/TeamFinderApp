// components/ChatScreen.tsx
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

// Datos de ejemplo para simular una conversación
const INITIAL_MESSAGES = [
  { id: '1', text: '¡¿Lista para la partida?!', isSent: false },
  { id: '2', text: '¡Sí! Dame un segundo', isSent: true },
  { id: '3', text: 'Ok, te espero en la sala', isSent: false },
  { id: '4', text: 'Ya voy, disculpa', isSent: true },
];

const ChatScreen = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const handleSendMessage = (newMessage: string) => {
    const newMsg = {
      id: Date.now().toString(), // ID único basado en el tiempo
      text: newMessage,
      isSent: true,
    };
    setMessages(previousMessages => [...previousMessages, newMsg]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble text={item.text} isSent={item.isSent} />}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      <MessageInput onSendMessage={handleSendMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  messagesList: {
    flex: 1,
  },
});

export default ChatScreen;