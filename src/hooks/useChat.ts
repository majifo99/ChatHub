import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { fetchChatMessages, postChatMessage } from '../services/chatService';
import { ChatMessage } from '../types/ChatMessage';

export const useChat = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      connection?.stop();
    };
  }, [connection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connect = async (user: string, recipient: string) => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/chathub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.on('ReceiveMessage', (userName: string, message: string, to: string) => {
      console.log('Mensaje recibido:', { userName, message, to, user, recipient });
      const timestamp = new Date().toLocaleTimeString();
      if (
        (recipient === 'BROADCAST' && to === 'BROADCAST') ||
        (userName === user && to === recipient) ||
        (userName === recipient && to === user)
      ) {
        setMessages(prev => [...prev, { user: userName, recipient: to, message, timestamp }]);
      } else {
        console.log('Mensaje descartado:', { userName, to, user, recipient });
      }
    });

    setConnection(newConnection);

    try {
      console.log('Iniciando conexión con SignalR...');
      await newConnection.start();
      console.log('Conexión establecida:', newConnection.state);
      setIsConnected(true);
      const history = await fetchChatMessages(user, recipient);
      setMessages(history);
    } catch (err) {
      console.error('Error al conectar al hub:', err);
      setIsConnected(false);
    }

    newConnection.onclose(err => {
      console.warn('Conexión cerrada:', err);
      setIsConnected(false);
    });
  };

  const send = async (user: string, recipient: string, message: string) => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.error('No hay conexión activa con SignalR');
      return;
    }

    const timestamp = new Date().toISOString();
    const payload: ChatMessage = { user, recipient, message, timestamp };

    try {
      await connection.invoke('SendMessage', user, message, recipient);
      await postChatMessage(payload);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  return { connect, send, messages, isConnected, messagesEndRef };
};