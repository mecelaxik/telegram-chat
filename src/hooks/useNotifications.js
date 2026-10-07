import { useEffect, useState } from 'react';
import { deleteNotification, parseNotification, receiveNotification } from '../api.js';

const RETRY_DELAY_MS = 3000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Long-polling GREEN-API: ReceiveNotification -> обработка -> DeleteNotification.
// Возвращает true, пока связь с API в порядке.
export default function useNotifications(creds, onMessage) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(creds, controller.signal);
          setOnline(true);
          if (!notification) continue; // очередь пуста

          const parsed = parseNotification(notification.body);
          if (parsed) onMessage(parsed);
          // Удаляем любое обработанное уведомление, иначе API будет отдавать его снова
          await deleteNotification(creds, notification.receiptId);
        } catch {
          if (controller.signal.aborted) return;
          setOnline(false);
          await wait(RETRY_DELAY_MS);
        }
      }
    })();

    return () => controller.abort();
  }, [creds, onMessage]);

  return online;
}
