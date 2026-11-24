import { useState } from 'react';
import { signIn } from '../supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email atau password salah.'
          : err.message || 'Gagal login.'
      );
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap login-wrap">
      <div className="login-card">
        <div className="login-head">
          <div className="logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
              <rect x="5" y="6" width="22" height="20" rx="6" fill="#172033" fillOpacity="0.1" />
              <rect x="5.5" y="6.5" width="21" height="19" rx="5.5" stroke="#172033" strokeWidth="2.2" />
              <path d="M11 16.2L14.4 19.6L21.5 12.5" stroke="#172033" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="25.5" cy="6.5" r="2.2" fill="#172033" />
            </svg>
          </div>
          <div>
            <h1 className="login-title">MyTask</h1>
            <p className="login-sub">Masuk untuk mengelola daftar tugas Anda</p>
          </div>
        </div>

        <form className="panel" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>

          <div className="field">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
            />
          </div>

          {error && <p className="edit-error" style={{ marginBottom: '12px' }}>{error}</p>}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </div>
    </main>
  );
}