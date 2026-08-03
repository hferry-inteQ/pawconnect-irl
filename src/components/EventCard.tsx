import { MapPin, Clock, User } from 'lucide-react';
import type { EventWithRelations } from '../lib/database.types';

interface Props {
  event: EventWithRelations;
  onClick: (event: EventWithRelations) => void;
}

function getDateParts(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: d.toLocaleDateString('en-US', { day: 'numeric' }),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

const categoryColors: Record<string, string> = {
  green:   'bg-green-600',
  amber:   'bg-amber-500',
  orange:  'bg-orange-500',
  sky:     'bg-sky-600',
  emerald: 'bg-emerald-600',
  blue:    'bg-blue-600',
  rose:    'bg-rose-600',
  yellow:  'bg-yellow-500',
};

export default function EventCard({ event, onClick }: Props) {
  const { month, day, weekday, time } = getDateParts(event.event_date);
  const catColor = event.event_categories
    ? (categoryColors[event.event_categories.color] ?? 'bg-stone-600')
    : null;

  return (
    <button
      onClick={() => onClick(event)}
      className="group text-left w-full bg-white overflow-hidden border border-stone-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex flex-col"
    >
      <div className="relative overflow-hidden flex-shrink-0 bg-stone-100" style={{ aspectRatio: '16/9' }}>
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {catColor && event.event_categories && (
          <div className={`absolute top-0 left-0 ${catColor} text-white text-[10px] font-bold px-3 py-1.5 tracking-widest uppercase">
            {event.event_categories.name}
          </div>
        )}

        {event.is_free ? (
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 tracking-widest uppercase">
            Free
          </div>
        ) : event.price_text ? (
          <div className="absolute top-0 right-0 bg-stone-900/80 text-white text-[10px] font-semibold px-3 py-1.5 tracking-wide">
            {event.price_text}
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 bg-blue-700 text-white px-3 py-2 text-center leading-none">
          <div className="text-[9px] font-black tracking-widest uppercase">{month}</div>
          <div className="text-2xl font-black leading-none mt-0.5">{day}</div>
          <div className="text-[9px] font-bold tracking-wide mt-0.5">{weekday}</div>
        </div>

        {event.cities?.name && (
          <div className="absolute bottom-0 right-0 bg-sky-700 text-white px-3 py-2 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-[11px] font-bold tracking-wide leading-none">{event.cities.name}</span>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col flex-1 gap-2 sm:gap-3">
        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 sm:gap-2 mt-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-500">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 flex-shrink-0" />
            <span className="font-semibold text-stone-700">{time}</span>
          </div>

          <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-500">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-semibold text-stone-700 truncate block text-xs sm:text-sm">{event.location_name}</span>
              {event.address && (
                <span className="text-stone-400 text-[10px] sm:text-xs truncate block mt-0.5">{event.address}</span>
              )}
            </div>
          </div>

          {event.organizer_name && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500 pt-2 border-t border-stone-100">
              <User className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="text-stone-500 text-sm truncate">{event.organizer_name}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
