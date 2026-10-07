export const formatTime = (ms) =>
  new Date(ms).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export const chatTitle = (chatId) => chatId.split('@')[0];
