import { useState } from 'react';
import { defaultApiUrl, getStateInstance } from '../api.js';

export default function Login({ onLogin }) {
  const [idInstance, setId] = useState('');
  const [apiTokenInstance, setToken] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const creds = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: (apiUrl.trim() || defaultApiUrl(idInstance.trim())).replace(/\/$/, ''),
    };
    try {
      const state = await getStateInstance(creds);
      if (state?.stateInstance !== 'authorized') {
        setError(`Аккаунт не авторизован (статус: ${state?.stateInstance ?? 'неизвестен'}). Отсканируйте QR-код в личном кабинете GREEN-API.`);
      } else {
        onLogin(creds);
      }
    } catch {
      setError('Не удалось войти. Проверьте idInstance и apiTokenInstance, при необходимости укажите apiUrl из личного кабинета.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit}>
        <h1>Вход в чат</h1>
        <p className="login__hint">Введите данные инстанса из личного кабинета GREEN-API.</p>
        <label>
          idInstance
          <input value={idInstance} onChange={(e) => setId(e.target.value)} inputMode="numeric" required autoFocus />
        </label>
        <label>
          apiTokenInstance
          <input type="password" value={apiTokenInstance} onChange={(e) => setToken(e.target.value)} required />
        </label>
        <details>
          <summary>Дополнительно</summary>
          <label>
            apiUrl
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder={idInstance ? defaultApiUrl(idInstance.trim()) : 'https://api.green-api.com'}
            />
          </label>
        </details>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={loading}>{loading ? 'Проверяем…' : 'Войти'}</button>
      </form>
    </main>
  );
}
