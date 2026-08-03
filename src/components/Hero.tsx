import { Search, MapPin, Calendar, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import type { EventWithRelations } from '../lib/database.types';

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  events?: EventWithRelations[];
}

function getDateLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
}

export default function Hero({ searchQuery, onSearchChange, events = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = searchQuery.trim().toLowerCase();

  const suggestions = q.length >= 1
    ? events
        .filter(e => {
          const hay = [e.title, e.location_name, e.cities?.name ?? '', e.event_categories?.name ?? ''].join(' ').toLowerCase();
          return hay.includes(q);
        })
        .slice(0, 7)
    : [];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleInput(v: string) {
    onSearchChange(v);
    setOpen(true);
    setActiveIndex(-1);
  }

  function handleSelect(e: EventWithRelations) {
    onSearchChange(e.title);
    setOpen(false);
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleKeyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (ev.key === 'Enter' && activeIndex >= 0) {
      ev.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (ev.key === 'Escape') {
      setOpen(false);
    }
  }

  const showDropdown = open && suggestions.length > 0;

  return (
    <section className="relative bg-stone-950 text-white" style={{ zIndex: 40 }}>
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg"
          alt="Dogs at a park"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#071428]/90 via-[#0c2252]/80 to-[#0f3460]/65" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 lg:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-400/15 border border-blue-400/25 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
            <MapPin className="w-3.5 h-3.5" />
            Good dogs are everywhere
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-4">
            Find Dog Events<br />
            <span className="text-blue-300">Near You</span>
          </h1>

          <p className="text-blue-100/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg font-normal">
            Doggy meetups, adoption events, fostering info, and more.
          </p>

          <div ref={containerRef} className="relative w-full max-w-lg z-20">
            <div className="flex shadow-warm-lg overflow-hidden" style={{ borderRadius: showDropdown ? '12px 12px 0 0' : '12px' }}>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => handleInput(e.target.value)}
                  onFocus={() => setOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search events..."
                  autoComplete="off"
                  className="w-full pl-11 pr-10 py-4 bg-white text-stone-900 text-sm font-medium placeholder-stone-400 focus:outline-none border-0"
                />
                {searchQuery && (
                  <button
                    onMouseDown={e => { e.preventDefault(); onSearchChange(''); setOpen(false); inputRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => { setOpen(false); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm px-6 py-4 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Search
              </button>
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-stone-100 overflow-visible z-50" style={{ borderRadius: '0 0 12px 12px' }}>
                {suggestions.map((event, i) => (
                  <button
                    key={event.id}
                    onMouseDown={e => { e.preventDefault(); handleSelect(event); }}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0 transition-colors ${
                      i === activeIndex ? 'bg-blue-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt=""
                        className="w-10 h-10 object-cover flex-shrink-0 bg-stone-100"
                        style={{ borderRadius: 4 }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate leading-snug">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {event.cities?.name && (
                          <span className="flex items-center gap-1 text-xs text-stone-400">
                            <MapPin className="w-3 h-3" />
                            {event.cities.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <Calendar className="w-3 h-3" />
                          {getDateLabel(event.event_date)}
                        </span>
                      </div>
                    </div>
                    {event.is_free && (
                      <span className="flex-shrink-0 self-center text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 uppercase tracking-widest">
                        Free
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-5 text-xs text-blue-200/50 font-medium">
            <span className="text-blue-300 font-semibold">Dallas · Fort Worth · Austin · New Orleans · Chicago</span>
            <span className="ml-1.5 text-blue-200/40">& growing</span>
          </p>
        </div>
      </div>
    </section>
  );
}
