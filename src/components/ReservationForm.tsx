import { useState } from 'react';
import { CalendarDays, Clock, Users, Phone, User, MessageSquare, CheckCircle2, Loader2, UtensilsCrossed } from 'lucide-react';
import { supabase, type NewReservation } from '@/lib/supabase';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

const todayISO = () => new Date().toISOString().split('T')[0];

export default function ReservationForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    party_size: '2',
    reservation_date: todayISO(),
    reservation_time: '19:00',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: NewReservation = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      party_size: parseInt(form.party_size, 10),
      reservation_date: form.reservation_date,
      reservation_time: form.reservation_time,
      notes: form.notes.trim() || null,
    };

    const { error: insertError } = await supabase.from('reservations').insert(payload);

    setSubmitting(false);

    if (insertError) {
      setError('Something went wrong while booking your table. Please try again.');
      return;
    }

    setSuccess(true);
    setForm({
      name: '',
      phone: '',
      party_size: '2',
      reservation_date: todayISO(),
      reservation_time: '19:00',
      notes: '',
    });
    setTimeout(() => setSuccess(false), 6000);
  };

  const inputClass =
    'w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 py-3 text-stone-800 placeholder-stone-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-amber-700 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-amber-200 backdrop-blur">
            <UtensilsCrossed className="h-4 w-4" />
            Now accepting reservations
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">
            Reserve Your Table
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-stone-300">
            Book an unforgettable dining experience in just a few moments. We can't wait to host you.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto -mt-10 max-w-2xl px-6 pb-20">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/5 sm:p-10">
          {success ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-bold text-stone-800">Reservation Confirmed!</h2>
              <p className="mt-2 text-stone-500">
                We've received your request and will see you soon. A confirmation will be sent to your phone shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 rounded-xl bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Book Another Table
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-2">
                <h2 className="font-serif text-2xl font-bold text-stone-800">Booking Details</h2>
                <p className="text-sm text-stone-500">Fill in the details below and we'll take care of the rest.</p>
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Full Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Party size */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Number of Guests</label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <select
                    value={form.party_size}
                    onChange={(e) => update('party_size', e.target.value)}
                    className={inputClass}
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Date</label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <input
                      type="date"
                      required
                      min={todayISO()}
                      value={form.reservation_date}
                      onChange={(e) => update('reservation_date', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Time</label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <select
                      value={form.reservation_time}
                      onChange={(e) => update('reservation_time', e.target.value)}
                      className={inputClass}
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Special Requests <span className="text-stone-400">(optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3.5 top-4 h-5 w-5 text-stone-400" />
                  <textarea
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    placeholder="Allergies, high chair, window seat, birthday celebration..."
                    rows={3}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 py-3 text-stone-800 placeholder-stone-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Booking your table...
                  </>
                ) : (
                  'Confirm Reservation'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}
