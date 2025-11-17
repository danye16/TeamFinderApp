// components/MessageBubble.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageBubbleProps {
  text: string;
  isSent: boolean;
}

const MessageBubble = ({ text, isSent }: MessageBubbleProps) => {
  return (
    <View style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}>
      <Text style={[styles.text, isSent ? styles.sentText : styles.receivedText]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '75%',
    marginVertical: 5,
    padding: 15,
    borderRadius: 20,
  },
  sentContainer: {
    backgroundColor: '#FF3131',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
    transform: [{ skewX: '-5deg' }],
  },
  receivedContainer: {
    backgroundColor: '#252525',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    borderColor: '#FFD700',
    borderWidth: 1,
    transform: [{ skewX: '5deg' }],
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
  },
  sentText: {
    color: '#FFFFFF',
  },
  receivedText: {
    color: '#CCCCCC',
  },
});

export default MessageBubble;