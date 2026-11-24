import { useEffect, useState } from 'react';
import { supabase, signOut } from './supabaseClient';
import TaskListPage from './pages/TaskListPage';
import InputPage from './pages/InputPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [session, setSession] = useState(undefined);
  const [page, setPage] = useState(() =>
    window.location.hash === '#/input' ? 'input' : 'index'
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onHash = () => {
      setPage(window.location.hash === '#/input' ? 'input' : 'index');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (target) => {
    window.location.hash = target === 'input' ? '#/input' : '#/';
    setPage(target);
    window.scrollTo(0, 0);
  };

  if (session === undefined) {
    return (
      <main className="page-wrap login-wrap">
        <div className="empty">Memeriksa sesi login...</div>
      </main>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  const userEmail = session.user?.email || '';

  return page === 'input' ? (
    <InputPage onBack={() => navigate('index')} userEmail={userEmail} onLogout={signOut} />
  ) : (
    <TaskListPage onGoInput={() => navigate('input')} userEmail={userEmail} onLogout={signOut} />
  );
}