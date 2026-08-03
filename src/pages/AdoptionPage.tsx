import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EventWithRelations } from '../lib/database.types';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import { Loader2 } from 'lucide-react';

export default function AdoptionPage() {
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventWithRelations | null>(null);

  useEffect(() => {
    supabase
      .from('events')
      .select('*, cities(*), event_categories(*)')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        if (data) setEvents(data as EventWithRelations[]);
        setLoading(false);
      });
  }, []);

  const shelterEvents = events.filter(e =>
    e.event_categories?.slug === 'adoption' || e.event_categories?.slug === 'fostering'
  );

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-b border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-stone-900 leading-tight mb-4">
              Adoption &<br /><span className="text-amber-600">Fostering Events</span>
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl font-normal">
              inteQ celebrates all those who foster animals and choose adoption to find their new best friend.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <>
          {shelterEvents.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Shelter Events Near You</h2>
                <p className="text-stone-500 mt-1.5 text-sm sm:text-base">From SPCA, Humane Society, and rescue groups</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shelterEvents.map(event => (
                  <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}
