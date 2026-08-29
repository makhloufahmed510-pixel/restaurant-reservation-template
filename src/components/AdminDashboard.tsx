import { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays, Clock, Users, Phone, Trash2, RefreshCw, Loader2,
  CheckCircle2, XCircle, Clock3, ClipboardList, Search, ChevronDown, MessageCircle, PhoneCall, AlertTriangle,
} from 'lucide-react';
import { supabase, type Reservation, type ReservationStatus } from '@/lib/supabase';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; icon: typeof Clock3 }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock3 },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-stone-200 text-stone-600 border-stone-300', icon: ClipboardList },
};

const STATUS_ORDER: ReservationStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [timingFilter, setTimingFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    setLoading(false);
    if (fetchError) {
      setError('Failed to load reservations.');
      return;
    }
    setReservations((data as Reservation[]) ?? []);
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateStatus = async (id: string, status: ReservationStatus) => {
    setUpdatingId(id);
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);
    setUpdatingId(null);
    if (updateError) {
      setError('Failed to update reservation status.');
      return;
    }
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const deleteReservation = async (id: string) => {
    const { error: deleteError } = await supabase.from('reservations').delete().eq('id', id);
    if (deleteError) {
      setError('Failed to delete reservation.');
      return;
    }
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      r.name.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q);
    const matchesTiming =
      timingFilter === 'all' ||
      (timingFilter === 'upcoming' && r.reservation_date >= today) ||
      (timingFilter === 'past' && r.reservation_date < today);
    return matchesStatus && matchesSearch && matchesTiming;
  });

  const conflictCount = (r: Reservation) =>
    reservations.filter(
      (x) =>
        x.reservation_date === r.reservation_date &&
        x.reservation_time === r.reservation_time &&
        x.status !== 'cancelled'
    ).length;

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    guests: reservations
      .filter((r) => r.status === 'confirmed' || r.status === 'pending')
      .reduce((sum, r) => sum + r.party_size, 0),
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-stone-800">Admin Dashboard</h1>
              <p className="text-sm text-stone-500">Manage incoming reservation requests</p>
            </div>
            <button
              onClick={fetchReservations}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total" value={stats.total} icon={ClipboardList} color="text-stone-600 bg-stone-100" />
            <StatCard label="Pending" value={stats.pending} icon={Clock3} color="text-amber-600 bg-amber-100" />
            <StatCard label="Confirmed" value={stats.confirmed} icon={CheckCircle2} color="text-green-600 bg-green-100" />
            <StatCard label="Expected Guests" value={stats.guests} icon={Users} color="text-blue-600 bg-blue-100" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterButton active={timingFilter === 'all'} onClick={() => setTimingFilter('all')} label="All Dates" />
          <FilterButton active={timingFilter === 'upcoming'} onClick={() => setTimingFilter('upcoming')} label="Upcoming" />
          <FilterButton active={timingFilter === 'past'} onClick={() => setTimingFilter('past')} label="Past" />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label="All Status" />
            {STATUS_ORDER.map((s) => (
              <FilterButton
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={STATUS_CONFIG[s].label}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center">
            <ClipboardList className="h-12 w-12 text-stone-300" />
            <p className="mt-4 text-lg font-medium text-stone-600">No reservations found</p>
            <p className="text-sm text-stone-400">
              {reservations.length === 0 ? 'New bookings will appear here.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                conflicts={conflictCount(r)}
                updating={updatingId === r.id}
                onStatusChange={updateStatus}
                onDelete={deleteReservation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Users; color: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-stone-800">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
        active
          ? 'bg-stone-900 text-white'
          : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
      }`}
    >
      {label}
    </button>
  );
}

function ReservationCard({
  reservation: r,
  conflicts,
  updating,
  onStatusChange,
  onDelete,
}: {
  reservation: Reservation;
  conflicts: number;
  updating: boolean;
  onStatusChange: (id: string, status: ReservationStatus) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[r.status];
  const StatusIcon = cfg.icon;
  const hasConflict = conflicts > 1;

  const openWhatsApp = () => {
    const message = 'Hi ' + r.name + ', this is Maison Bistro. Your reservation for ' + r.party_size + ' on ' + formatDate(r.reservation_date) + ' at ' + formatTime(r.reservation_time) + ' is ' + r.status + '.';
    const phoneDigits = r.phone.replace(/[^0-9]/g, '');
    window.open('https://wa.me/' + phoneDigits + '?text=' + encodeURIComponent(message), '_blank');
  };

  const callCustomer = () => {
    window.location.href = 'tel:' + r.phone;
  };

  return (
    <div className={`group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${hasConflict ? 'border-orange-300' : 'border-stone-200'}`}>
      {hasConflict && (
        <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          {conflicts} reservations at this same time
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-800">{r.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
            <Phone className="h-3.5 w-3.5" />
            {r.phone}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <Detail icon={CalendarDays} value={formatDate(r.reservation_date)} />
        <Detail icon={Clock} value={formatTime(r.reservation_time)} />
        <Detail icon={Users} value={`${r.party_size} ${r.party_size === 1 ? 'guest' : 'guests'}`} />
      </div>

      {r.notes && (
        <div className="mt-3 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
          <span className="font-medium text-stone-500">Notes: </span>
          {r.notes}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <div className="relative flex-1">
          <select
            value={r.status}
            disabled={updating}
            onChange={(e) => onStatusChange(r.id, e.target.value as ReservationStatus)}
            className="w-full appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-stone-700 transition hover:bg-stone-50 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirm</option>
            <option value="completed">Complete</option>
            <option value="cancelled">Cancel</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        </div>
        <button
          onClick={openWhatsApp}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-green-500 transition hover:border-green-200 hover:bg-green-50"
          title="Message on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          onClick={callCustomer}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-blue-500 transition hover:border-blue-200 hover:bg-blue-50"
          title="Call customer"
        >
          <PhoneCall className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(r.id)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          title="Delete reservation"
        >
          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, value }: { icon: typeof Users; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-stone-50 py-2 text-center">
      <Icon className="h-4 w-4 text-stone-400" />
      <span className="text-xs font-medium text-stone-700">{value}</span>
    </div>
  );
}

function formatDate(d: string): string {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}