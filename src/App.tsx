import { useState } from 'react';
import { CalendarPlus, LayoutDashboard } from 'lucide-react';
import ReservationForm from '@/components/ReservationForm';
import AdminDashboard from '@/components/AdminDashboard';

type View = 'book' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('book');

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
          <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-1">
            <NavButton active={view === 'book'} onClick={() => setView('book')} icon={CalendarPlus} label="Book a Table" />
            <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={LayoutDashboard} label="Admin" />
          </div>
        </div>
      </nav>

      {view === 'book' ? <ReservationForm /> : <AdminDashboard />}
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
