import axios from 'axios';
import { ChatMessage } from '../types/ChatMessage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchChatMessages = async (user: string, recipient: string): Promise<ChatMessage[]> => {
  try {
    const endpoint = recipient === 'BROADCAST' ? '/Chat/broadcast?limit=50' : `/Chat/${encodeURIComponent(user)}/${encodeURIComponent(recipient)}`;
    const { data } = await api.get(endpoint);
    return data.map((msg: any) => ({
      user: msg.User,
      recipient: msg.Recipient,
      message: msg.Message,
      timestamp: new Date(msg.Timestamp).toLocaleTimeString(),
    }));
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    return [];
  }
};

export const postChatMessage = async (message: ChatMessage): Promise<void> => {
  try {
    if (message.recipient === 'BROADCAST') {
      await api.post('/Chat/broadcast', {
        User: message.user,
        Message: message.message,
      });
    } else {
      await api.post('/Chat', message);
    }
  } catch (err) {
    console.error('Error al enviar mensaje:', err);
  }
};