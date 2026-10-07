import { useEffect, useRef, useState } from 'react';
import { chatTitle, formatTime } from '../utils.js';

export default function ChatWindow({ chat, onSend, onBack }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat?.messages.length, chat?.id]);

  if (!chat) {
    return (
      <section className="chat chat--empty">
        <p>Выберите чат или начните новый</p>
      </section>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(chat.id, value);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <section className="chat">
      <header className="chat__head">
        <button className="link chat__back" onClick={onBack} aria-label="Назад к списку чатов">‹</button>
        <span className="avatar">{(chat.name[0] || '?').toUpperCase()}</span>
        <div>
          <strong>{chat.name}</strong>
          <small>{chatTitle(chat.id)}</small>
        </div>
      </header>

      <div className="messages">
        {chat.messages.map((m) => (
          <div key={m.id} className={`msg msg--${m.direction}`}>
            <p>{m.text}</p>
            <span className="msg__meta">
              {m.status === 'sending' && 'отправка… '}
              {m.status === 'error' && 'не отправлено · '}
              {formatTime(m.time)}
            </span>
            {m.status === 'error' && m.error && <span className="msg__error">{m.error}</span>}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={submit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Сообщение"
          rows={1}
          aria-label="Текст сообщения"
        />
        <button className="btn" disabled={!text.trim()}>Отправить</button>
      </form>
    </section>
  );
}
