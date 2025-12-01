// app/chat/index.tsx
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '@/components/Mensajes/ChatScreen';

export default function PaginaChat() {
  const params = useLocalSearchParams();
  
  return (
    <ChatScreen 
      usuarioDestinoId={Number(params.usuarioDestinoId)} 
      juegoId={Number(params.juegoId)}
      nombreDestino={params.nombreDestino as string}
    />
  );
}