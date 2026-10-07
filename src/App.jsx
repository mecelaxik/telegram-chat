import { useState } from 'react';
import Login from './components/Login.jsx';
import Messenger from './components/Messenger.jsx';
import { clearCreds, loadCreds, saveCreds } from './storage.js';

export default function App() {
  const [creds, setCreds] = useState(loadCreds);

  const login = (c) => {
    saveCreds(c);
    setCreds(c);
  };

  const logout = () => {
    clearCreds();
    setCreds(null);
  };

  if (!creds) return <Login onLogin={login} />;
  // key: при смене аккаунта чаты загружаются заново
  return <Messenger key={creds.idInstance} creds={creds} onLogout={logout} />;
}
