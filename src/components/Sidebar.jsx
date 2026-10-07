import { useState } from 'react';
import { toChatId } from '../api.js';
import { formatTime } from '../utils.js';

export default function Sidebar({ chats, activeId, online, onOpen, onLogout }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const create = (e) => {
    e.preventDefault();
    const chatId = toChatId(phone);
    if (!chatId) return setError('Введите номер в международном формате, например 79991234567');
    setError('');
    setPhone('');
    onOpen(chatId);
  };

  return (
    <aside className="sidebar">
      <header className="sidebar__head">
        <h2>Чаты</h2>
        <span className={`dot ${online ? 'dot--on' : ''}`} title={online ? 'Подключено' : 'Нет связи с GREEN-API'} />
        <button className="link" onClick={onLogout}>Выйти</button>
      </header>

      <form className="new-chat" onSubmit={create}>
        <input
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError('');
          }}
          placeholder="Номер телефона, 79991234567"
          inputMode="tel"
          aria-label="Номер телефона получателя"
        />
        <button className="btn btn--small">Начать чат</button>
      </form>
      {error && <p className="error error--pad">{error}</p>}

      <ul className="chat-list">
        {chats.length === 0 && <li className="empty">Введите номер, чтобы начать переписку.</li>}
        {chats.map((chat) => {
          const last = chat.messages.at(-1);
          return (
            <li key={chat.id}>
              <button className={`chat-item ${chat.id === activeId ? 'chat-item--active' : ''}`} onClick={() => onOpen(chat.id)}>
                <span className="avatar">{(chat.name[0] || '?').toUpperCase()}</span>
                <span className="chat-item__body">
                  <span className="chat-item__name">{chat.name}</span>
                  <span className="chat-item__last">{last ? last.text : 'Нет сообщений'}</span>
                </span>
                {last && <span className="chat-item__time">{formatTime(last.time)}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
