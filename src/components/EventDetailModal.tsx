import { useEffect } from 'react';
import { X, Calendar, MapPin, User, DollarSign, Tag, Clock, ExternalLink, Phone, Globe } from 'lucide-react';
import type { EventWithRelations } from '../lib/database.types';
import CategoryBadge from './CategoryBadge';

interface Props {
  event: EventWithRelations | null;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

export default function EventDetailModal({ event, onClose }: Props) {
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-56 sm:h-72 flex-shrink-0">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {event.cities?.name && (
            <div className="absolute top-4 right-14 flex items-center gap-1 bg-sky-600 text-white px-2.5 py-1.5 shadow-lg">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs font-black tracking-wide uppercase">{event.cities.name}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            {(event.external_url || event.organizer_url) ? (
              <a
                href={event.external_url ?? event.organizer_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group/title inline-flex items-start gap-2 hover:opacity-90 transition-opacity"
              >
                <h2 className="text-white font-bold text-xl sm:text-2xl leading-tight drop-shadow-md underline decoration-white/40 group-hover/title:decoration-white/80">
                  {event.title}
                </h2>
                <ExternalLink className="w-4 h-4 text-white/60 group-hover/title:text-white flex-shrink-0 mt-1" />
              </a>
            ) : (
              <h2 className="text-white font-bold text-xl sm:text-2xl leading-tight drop-shadow-md">
                {event.title}
              </h2>
            )}
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {event.event_categories && (
              <CategoryBadge category={event.event_categories} size="md" />
            )}
            {event.is_free ? (
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 tracking-widest uppercase">
                Free Event
              </span>
            ) : (
              event.price_text && (
                <span className="bg-stone-800 text-white text-xs font-semibold px-3 py-1 tracking-wide">
                  {event.price_text}
                </span>
              )
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date">
              {formatDate(event.event_date)}
            </InfoRow>
            <InfoRow icon={<Clock className="w-4 h-4" />} label="Time">
              {formatTime(event.event_date)}
              {event.end_date && ` – ${formatTime(event.end_date)}`}
            </InfoRow>
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location">
              <span className="font-semibold">{event.location_name}</span>
              {event.address && (
                <>
                  <br />
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-500 text-xs hover:text-amber-700 hover:underline transition-colors"
                  >
                    {event.address}
                  </a>
                </>
              )}
            </InfoRow>
            <InfoRow icon={<User className="w-4 h-4" />} label="Organizer">
              {event.organizer_url ? (
                <a
                  href={event.organizer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:underline font-medium"
                >
                  {event.organizer_name}
                </a>
              ) : (
                event.organizer_name
              )}
            </InfoRow>
            {event.phone_number && (
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone">
                <a
                  href={`tel:${event.phone_number}`}
                  className="text-amber-700 hover:underline font-medium"
                >
                  {event.phone_number}
                </a>
              </InfoRow>
            )}
            {event.website && (
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Website">
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:underline font-medium break-all"
                >
                  {event.website.replace(/^https?:\/\//, '')}
                </a>
              </InfoRow>
            )}
            {!event.is_free && event.price_text && (
              <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Price">
                {event.price_text}
              </InfoRow>
            )}
            {event.max_dogs && (
              <InfoRow icon={<Tag className="w-4 h-4" />} label="Max dogs">
                {event.max_dogs} dogs
              </InfoRow>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-2">About this event</h3>
            <p className="text-stone-700 leading-relaxed text-sm sm:text-base">{event.description}</p>
            {event.external_url && (
              <a
                href={event.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on official website
              </a>
            )}
          </div>

          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map(tag => (
                <span key={tag} className="text-xs text-stone-500 bg-stone-100 border border-stone-200 px-2.5 py-1 font-medium tracking-wide">
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-amber-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
        <div className="text-stone-800 text-sm mt-0.5">{children}</div>
      </div>
    </div>
  );
}
