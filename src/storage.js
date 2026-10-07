const CREDS_KEY = 'gapi-creds';
const chatsKey = (idInstance) => `gapi-chats-${idInstance}`;

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export const loadCreds = () => read(CREDS_KEY, null);
export const saveCreds = (creds) => localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
export const clearCreds = () => localStorage.removeItem(CREDS_KEY);

// Сообщения, застрявшие в статусе «отправка» из-за закрытой вкладки, помечаем как неотправленные.
export function loadChats(idInstance) {
  const chats = read(chatsKey(idInstance), {});
  for (const chat of Object.values(chats)) {
    chat.messages = chat.messages.map((m) =>
      m.status === 'sending' ? { ...m, status: 'error', error: 'Отправка прервана' } : m,
    );
  }
  return chats;
}

export const saveChats = (idInstance, chats) =>
  localStorage.setItem(chatsKey(idInstance), JSON.stringify(chats));
