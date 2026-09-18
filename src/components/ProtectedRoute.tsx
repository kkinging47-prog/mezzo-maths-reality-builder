import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Props = { children: ReactNode; roles?: string[] };

export default function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation();
  const [status, setStatus] = useState<'loading'|'allowed'|'denied'|'signedout'>('loading');

  useEffect(() => {
    let alive = true;
    async function check() {
      if (!isSupabaseConfigured || !supabase) { if (alive) setStatus('signedout'); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { if (alive) setStatus('signedout'); return; }
      if (!roles?.length) { if (alive) setStatus('allowed'); return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (alive) setStatus(data?.role && roles.includes(data.role) ? 'allowed' : 'denied');
    }
    check();
    const { data: listener } = supabase?.auth.onAuthStateChange(() => check()) || { data: null as any };
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, [roles?.join('|')]);

  if (status === 'loading') return <div className="min-h-screen bg-slate-950 text-white grid place-items-center"><p className="font-bold">Loading your Mezzo VR profile…</p></div>;
  if (status === 'signedout') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (status === 'denied') return <Navigate to="/student/dashboard" replace />;
  return <>{children}</>;
}
