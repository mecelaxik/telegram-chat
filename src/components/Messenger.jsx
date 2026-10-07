import { useCallback, useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import useNotifications from '../hooks/useNotifications.js';
import { sendMessage } from '../api.js';
import { loadChats, saveChats } from '../storage.js';
import { chatTitle } from '../utils.js';

const newChat = (id, name) => ({ id, name: name || chatTitle(id), messages: [] });

export default function Messenger({ creds, onLogout }) {
  const [chats, setChats] = useState(() => loadChats(creds.idInstance));
  const [activeId, setActiveId] = useState(null);

  useEffect(() => saveChats(creds.idInstance, chats), [creds.idInstance, chats]);

  // Добавляет сообщение в чат, не создавая дублей по id
  const addMessage = useCallback((chatId, message, name) => {
    setChats((prev) => {
      const chat = prev[chatId] ?? newChat(chatId, name);
      if (chat.messages.some((m) => m.id === message.id)) return prev;
      return {
        ...prev,
        [chatId]: { ...chat, name: name || chat.name, messages: [...chat.messages, message] },
      };
    });
  }, []);

  const handleIncoming = useCallback(
    ({ chatId, name, direction, message }) =>
      addMessage(chatId, message, direction === 'in' ? name : ''),
    [addMessage],
  );

  const online = useNotifications(creds, handleIncoming);

  const updateMessages = (chatId, update) =>
    setChats((prev) => ({
      ...prev,
      [chatId]: { ...prev[chatId], messages: update(prev[chatId].messages) },
    }));

  const handleSend = async (chatId, text) => {
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    addMessage(chatId, { id: tempId, text, direction: 'out', time: Date.now(), status: 'sending' });
    try {
      const { idMessage } = await sendMessage(creds, chatId, text);
      updateMessages(chatId, (messages) =>
        // Уведомление об отправке могло прийти раньше ответа API — тогда временное сообщение лишнее
        messages.some((m) => m.id === idMessage)
          ? messages.filter((m) => m.id !== tempId)
          : messages.map((m) => (m.id === tempId ? { ...m, id: idMessage, status: 'sent' } : m)),
      );
    } catch (err) {
      updateMessages(chatId, (messages) =>
        messages.map((m) => (m.id === tempId ? { ...m, status: 'error', error: err.message } : m)),
      );
    }
  };

  const openChat = (chatId) => {
    setChats((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: newChat(chatId) }));
    setActiveId(chatId);
  };

  const sortedChats = Object.values(chats).sort(
    (a, b) => (b.messages.at(-1)?.time ?? 0) - (a.messages.at(-1)?.time ?? 0),
  );

  return (
    <div className={`app ${activeId ? 'app--chat-open' : ''}`}>
      <Sidebar chats={sortedChats} activeId={activeId} online={online} onOpen={openChat} onLogout={onLogout} />
      <ChatWindow chat={chats[activeId]} onSend={handleSend} onBack={() => setActiveId(null)} />
    </div>
  );
}
