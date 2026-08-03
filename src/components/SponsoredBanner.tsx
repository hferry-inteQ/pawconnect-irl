import { Heart, Home, Star } from 'lucide-react';
import type { EventWithRelations } from '../lib/database.types';
import EventCard from './EventCard';

interface Props {
  events: EventWithRelations[];
  onEventClick: (event: EventWithRelations) => void;
}

export default function SponsoredBanner({ events, onEventClick }: Props) {
  if (events.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-y border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold tracking-widest text-amber-700 uppercase">Sponsored by Paw Connect</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Adoption & Fostering Events
            </h2>
            <p className="text-stone-500 mt-1.5 text-sm sm:text-base max-w-xl">
              Paw Connect by inteQ partners with Texas shelters to connect dogs with loving homes.
              These events are free and open to everyone.
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <StatPill icon={<Heart className="w-4 h-4" />} label="Adoptions" value="80+" />
            <StatPill icon={<Home className="w-4 h-4" />} label="Fosters" value="100+" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} onClick={onEventClick} />
          ))}
        </div>

        <div className="mt-10 bg-white/70 border border-amber-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0 bg-amber-400 text-amber-900 rounded-xl p-3">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-900">What is Paw Connect by inteQ?</p>
            <p className="text-stone-500 text-sm mt-0.5">
              Paw Connect is a pet benefits program included with select residential leases — 24/7 vet hotline,
              prescription discounts, and community events like adoptions and fostering drives.
            </p>
          </div>
          <a
            href="https://inteq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-amber-200 rounded-xl px-4 py-3 min-w-[80px]">
      <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">{icon}</div>
      <p className="text-xl font-bold text-stone-900 text-center">{value}</p>
      <p className="text-xs text-stone-500 text-center">{label}</p>
    </div>
  );
}
