// Тонкая обёртка над GREEN-API (Telegram). Чтобы перейти на MAX или WhatsApp,
// достаточно поменять формат chatId и apiUrl в этом файле.

// У Telegram-инстансов apiUrl имеет вид https://4100.api.green-api.com,
// где 4100 — первые четыре цифры idInstance.
export function defaultApiUrl(idInstance) {
  return /^\d{4}/.test(idInstance)
    ? `https://${idInstance.slice(0, 4)}.api.green-api.com`
    : 'https://api.green-api.com';
}

// Оставляем только цифры: +7 (999) 123-45-67 -> 79991234567@c.us
export function toChatId(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? `${digits}@c.us` : null;
}

async function request(creds, method, path, { body, signal } = {}) {
  const url = `${creds.apiUrl}/waInstance${creds.idInstance}/${path}`;
  const res = await fetch(url, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GREEN-API ${res.status}${text ? `: ${text}` : ''}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const getStateInstance = (c) =>
  request(c, 'GET', `getStateInstance/${c.apiTokenInstance}`);

export const sendMessage = (c, chatId, message) =>
  request(c, 'POST', `sendMessage/${c.apiTokenInstance}`, { body: { chatId, message } });

// Ждёт уведомление до 5 секунд; если очередь пуста, вернёт null.
export const receiveNotification = (c, signal) =>
  request(c, 'GET', `receiveNotification/${c.apiTokenInstance}?receiveTimeout=5`, { signal });

export const deleteNotification = (c, receiptId) =>
  request(c, 'DELETE', `deleteNotification/${c.apiTokenInstance}/${receiptId}`);

// Приводит уведомление к виду { direction, chatId, name, message } или null,
// если это не текстовое сообщение (статусы, файлы и т. д. по заданию не нужны).
export function parseNotification(body) {
  if (!body) return null;
  const { typeWebhook, senderData, messageData, idMessage, timestamp } = body;
  const direction =
    typeWebhook === 'incomingMessageReceived'
      ? 'in'
      : typeWebhook === 'outgoingMessageReceived' || typeWebhook === 'outgoingAPIMessageReceived'
        ? 'out'
        : null;
  if (!direction || !senderData?.chatId) return null;

  const text =
    messageData?.textMessageData?.textMessage ??
    messageData?.extendedTextMessageData?.text ??
    null;
  if (!text) return null;

  return {
    direction,
    chatId: senderData.chatId,
    name: senderData.chatName || senderData.senderName || '',
    message: { id: idMessage, text, direction, time: (timestamp || Date.now() / 1000) * 1000 },
  };
}
