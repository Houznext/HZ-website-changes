import { useState, useEffect } from 'react';
import { getUser, getToken, clearSession, type AdminUser } from '@/lib/session';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const u = getUser();
    if (token && u) {
      setUser(u);
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    clearSession();
    window.location.href = '/login';
  };

  return { user, loading, signOut, isAuthenticated: !!user };
}
