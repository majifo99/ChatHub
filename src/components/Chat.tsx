import React, { useState, useRef } from 'react';
import { useChat } from '../hooks/useChat';

const getRandomColor = () => {
  const colors = ['#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Chat: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connect, send, messages, isConnected, messagesEndRef } = useChat();

  const userColors = useRef<Map<string, string>>(new Map());

  const getUserColor = (user: string) => {
    if (!userColors.current.has(user)) {
      userColors.current.set(user, getRandomColor());
    }
    return userColors.current.get(user)!;
  };

  const handleConnect = async () => {
    if (!userName.trim()) {
      setError('Introduce tu nombre de usuario.');
      return;
    }
    if (!isBroadcast && !recipient.trim()) {
      setError('Introduce un receptor para el chat privado.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await connect(userName, isBroadcast ? 'BROADCAST' : recipient);
    } catch (err) {
      setError('Error al conectar al chat. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      send(userName, isBroadcast ? 'BROADCAST' : recipient, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="relative mx-auto border-8 border-gray-800 bg-gray-800 rounded-xl shadow-xl h-[600px] w-[300px]">
        <div className="rounded-xl overflow-hidden bg-[#e5ddd5] flex flex-col h-full w-full">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center flex-grow p-8 text-center">
              {isLoading ? (
                <p className="text-gray-700">Cargando...</p>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-700 mb-4">WhatsApp Clone</h2>
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="Tu nombre..."
                    className="w-full p-2 mb-2 border border-gray-400 rounded-md"
                  />
                  {!isBroadcast && (
                    <input
                      type="text"
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      placeholder="Receptor..."
                      className="w-full p-2 mb-4 border border-gray-400 rounded-md"
                    />
                  )}
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={isBroadcast}
                      onChange={e => setIsBroadcast(e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Unirse al chat global</label>
                  </div>
                  <button
                    onClick={handleConnect}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Entrar al Chat
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="bg-green-700 text-white text-center py-2 font-semibold">
                {isBroadcast ? 'Chat Global' : `Chat entre ${userName} y ${recipient}`}
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.user === userName ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[75%] p-2 rounded-lg text-sm ${
                        m.user === userName
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white text-black rounded-bl-none'
                      }`}
                    >
                      {isBroadcast && (
                        <p className="font-bold" style={{ color: getUserColor(m.user) }}>
                          {m.user}
                        </p>
                      )}
                      <p>{m.message}</p>
                      <small className="block text-right text-xs mt-1">{m.timestamp}</small>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center p-2 border-t border-gray-300 bg-white">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 mr-2 transition"
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-green-200 hover:bg-green-400 text-white px-4 py-2 rounded-full transition"
                >
                 🛩️
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
