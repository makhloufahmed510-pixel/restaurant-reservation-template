import { useState, useEffect } from 'react';
import { CalendarPlus, LayoutDashboard, LogOut } from 'lucide-react';
import ReservationForm from '@/components/ReservationForm';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLogin from '@/components/AdminLogin';
import { supabase } from '@/lib/supabase';

type View = 'book' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('book');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setView('book');
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-stone-800">Maison</span>
            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
              BISTRO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-1">
              <NavButton active={view === 'book'} onClick={() => setView('book')} icon={CalendarPlus} label="Book a Table" />
              <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={LayoutDashboard} label="Admin" />
            </div>
            {isLoggedIn && view === 'admin' && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {view === 'book' && <ReservationForm />}
      {view === 'admin' && checkingSession && (
        <p className="py-16 text-center text-stone-500">Loading...</p>
      )}
      {view === 'admin' && !checkingSession && !isLoggedIn && (
        <AdminLogin onSuccess={() => setIsLoggedIn(true)} />
      )}
      {view === 'admin' && !checkingSession && isLoggedIn && <AdminDashboard />}
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CalendarPlus;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-stone-900 text-white shadow-sm'
          : 'text-stone-600 hover:text-stone-900'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
