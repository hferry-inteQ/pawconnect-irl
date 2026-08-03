import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapPin, Search, Tag, X, Utensils, TreePine, Dog, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DogPark } from '../lib/dog-parks.types';
import L from 'leaflet';

const CITIES = ['Dallas', 'Fort Worth', 'Austin', 'New Orleans', 'Chicago'];

const TYPE_CONFIG: Record<DogPark['type'], { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  dog_park:       { label: 'Dog Park',         color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', icon: Dog },
  trail:          { label: 'Trail',            color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   icon: TreePine },
  bar_restaurant: { label: 'Bar / Restaurant', color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-200',    icon: Utensils },
};

const CITY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Dallas:        { lat: 32.8207, lng: -96.8395, zoom: 11 },
  'Fort Worth':  { lat: 32.7555, lng: -97.3308, zoom: 11 },
  Austin:        { lat: 30.2729, lng: -97.7444, zoom: 11 },
  'New Orleans': { lat: 29.9771, lng: -90.0715, zoom: 12 },
  Chicago:       { lat: 41.9282, lng: -87.6678, zoom: 11 },
};

const FILTER_TYPES: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'dog_park', label: 'Dog Parks' },
  { value: 'trail', label: 'Trails' },
  { value: 'bar_restaurant', label: 'Bars & Restaurants' },
];

const PIN_COLORS: Record<string, string> = {
  dog_park:       '#059669',
  trail:          '#d97706',
  bar_restaurant: '#e11d48',
};

function makeIcon(color: string, active: boolean) {
  const size = active ? 18 : 13;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}">
    ${active ? `<circle cx="${size}" cy="${size}" r="${size}" fill="${color}" opacity="0.2"/>` : ''}
    <circle cx="${size}" cy="${size}" r="${active ? 10 : 7}" fill="${color}" stroke="white" stroke-width="2.5"/>
    ${active ? `<circle cx="${size}" cy="${size}" r="4" fill="white"/>` : ''}
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [size * 2, size * 2], iconAnchor: [size, size] });
}

function MapEmbed({ city, parks, selected, onSelect }: {
  city: string; parks: DogPark[]; selected: DogPark | null; onSelect: (p: DogPark) => void;
}) {
  const center = CITY_CENTERS[city] ?? CITY_CENTERS['Dallas'];
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const map = L.map(container, {
      center: [center.lat, center.lng],
      zoom: center.zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    let destroyed = false;
    requestAnimationFrame(() => { if (!destroyed) map.invalidateSize(); });
    const ro = new ResizeObserver(() => { if (!destroyed) map.invalidateSize(); });
    ro.observe(container);
    return () => {
      destroyed = true;
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existingIds = new Set(markersRef.current.keys());
    const newIds = new Set(parks.map(p => p.id));
    for (const id of existingIds) {
      if (!newIds.has(id)) { markersRef.current.get(id)?.remove(); markersRef.current.delete(id); }
    }
    for (const park of parks) {
      const isActive = selected?.id === park.id;
      const color = PIN_COLORS[park.type] ?? '#78716c';
      const icon = makeIcon(color, isActive);
      if (markersRef.current.has(park.id)) {
        markersRef.current.get(park.id)!.setIcon(icon);
      } else {
        const marker = L.marker([park.lat, park.lng], { icon }).addTo(map).on('click', () => onSelect(park));
        markersRef.current.set(park.id, marker);
      }
    }
  }, [parks, selected, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 14), { animate: true, duration: 0.5 });
  }, [selected]);

  return <div ref={containerRef} className="w-full h-full" style={{ position: 'relative' }} />;
}

function ParkListItem({ park, isSelected, onClick }: { park: DogPark; isSelected: boolean; onClick: () => void }) {
  const cfg = TYPE_CONFIG[park.type] ?? TYPE_CONFIG.dog_park;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left group flex gap-3 px-4 py-3.5 border-b border-stone-100 transition-all focus:outline-none ${
        isSelected
          ? 'bg-emerald-50 border-l-[3px] border-l-emerald-500'
          : 'hover:bg-stone-50 border-l-[3px] border-l-transparent'
      }`}
    >
      <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded bg-stone-100">
        <img src={park.image_url} alt={park.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-bold leading-snug line-clamp-1 transition-colors ${isSelected ? 'text-emerald-700' : 'text-stone-900 group-hover:text-emerald-700'}`}>
          {park.name}
        </h3>
        <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${cfg.color}`}>{cfg.label}</p>
        {park.address && (
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
            <em>{park.address}</em>
          </p>
        )}
        {park.hours && (
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5 line-clamp-1">{park.hours}</p>
        )}
      </div>
    </button>
  );
}

function MapOverlayCard({ park, onClose }: { park: DogPark; onClose: () => void }) {
  const cfg = TYPE_CONFIG[park.type] ?? TYPE_CONFIG.dog_park;
  const Icon = cfg.icon;

  return (
    <div
      className="absolute bottom-4 left-4 z-[500] w-[340px] max-w-[calc(100%-2rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
      style={{ maxHeight: 'calc(100% - 2rem)' }}
    >
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 120 }}>
        <img src={park.image_url} alt={park.name} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border mb-1 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <Icon className="w-2.5 h-2.5" />{cfg.label}
          </span>
          <h2 className="text-white font-bold text-base leading-tight drop-shadow">{park.name}</h2>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {park.description && (
          <div className="m-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-stone-800 text-sm leading-relaxed">{park.description}</p>
          </div>
        )}

        {park.dog_friendly_notes && (
          <div className="mx-3 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-xs leading-relaxed font-medium">{park.dog_friendly_notes}</p>
          </div>
        )}

        <div className="px-3 pb-3 space-y-2">
          {park.is_free && (
            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              Free
            </span>
          )}
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(park.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            Get Directions
          </a>
          <InfoRow label="Address">{park.address}</InfoRow>
          {park.hours && <InfoRow label="Hours">{park.hours}</InfoRow>}
          {park.phone && (
            <InfoRow label="Phone">
              <a href={`tel:${park.phone}`} className="text-emerald-700 hover:underline">{park.phone}</a>
            </InfoRow>
          )}
          {park.website && (
            <InfoRow label="Website">
              <a href={park.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline truncate flex items-center gap-1">
                {park.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            </InfoRow>
          )}
          {park.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {park.tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-full">
                  <Tag className="w-2 h-2" />{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mt-0.5 w-14 flex-shrink-0">{label}</span>
      <span className="text-stone-700 text-xs leading-relaxed">{children}</span>
    </div>
  );
}

function MobileBottomSheet({ park, onClose }: { park: DogPark; onClose: () => void }) {
  const cfg = TYPE_CONFIG[park.type] ?? TYPE_CONFIG.dog_park;
  const Icon = cfg.icon;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-2xl shadow-2xl border-t border-stone-200 flex flex-col" style={{ maxHeight: '65vh' }}>
      <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0">
        <div className="w-10 h-1 bg-stone-300 rounded-full" />
      </div>

      <div className="relative flex-shrink-0 overflow-hidden mx-4 rounded-xl" style={{ height: 140 }}>
        <img src={park.image_url} alt={park.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent rounded-xl" />
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border mb-1.5 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <Icon className="w-2.5 h-2.5" />{cfg.label}
          </span>
          <h2 className="text-white font-bold text-sm leading-tight drop-shadow">{park.name}</h2>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
        {park.is_free && (
          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Free</span>
        )}

        {park.description && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-stone-800 text-sm leading-relaxed">{park.description}</p>
          </div>
        )}

        {park.dog_friendly_notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-amber-800 text-xs leading-relaxed font-medium">{park.dog_friendly_notes}</p>
          </div>
        )}

        <div className="space-y-2.5">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(park.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-bold px-4 py-3 rounded-lg transition-colors justify-center"
          >
            <MapPin className="w-4 h-4" />
            Get Directions
          </a>
          <InfoRow label="Address">{park.address}</InfoRow>
          {park.hours && <InfoRow label="Hours">{park.hours}</InfoRow>}
          {park.phone && (
            <InfoRow label="Phone">
              <a href={`tel:${park.phone}`} className="text-emerald-700 hover:underline">{park.phone}</a>
            </InfoRow>
          )}
          {park.website && (
            <InfoRow label="Website">
              <a href={park.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline truncate flex items-center gap-1">
                {park.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            </InfoRow>
          )}
        </div>

        {park.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pb-2">
            {park.tags.map(t => (
              <span key={t} className="flex items-center gap-1 text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-full">
                <Tag className="w-2 h-2" />{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DogParksPage() {
  const [parks, setParks] = useState<DogPark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Dallas');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPark, setSelectedPark] = useState<DogPark | null>(null);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    supabase.from('dog_parks').select('*').order('type').order('name').then(({ data }) => {
      if (data) setParks(data.map(p => ({ ...p, lat: parseFloat(p.lat), lng: parseFloat(p.lng) })) as DogPark[]);
      setLoading(false);
    });
  }, []);

  const cityParks = useMemo(() => parks.filter(p => p.city === selectedCity), [parks, selectedCity]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return cityParks.filter(p => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (q) {
        const hay = [p.name, p.description, p.address, p.type, ...p.tags].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cityParks, typeFilter, search]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of cityParks) counts[p.type] = (counts[p.type] ?? 0) + 1;
    return counts;
  }, [cityParks]);

  const handleSelect = useCallback((p: DogPark) => {
    setSelectedPark(prev => prev?.id === p.id ? null : p);
    setMobileView('map');
  }, []);

  function handleCityChange(city: string) {
    setSelectedCity(city);
    setSelectedPark(null);
    setTypeFilter('');
    setSearch('');
  }

  return (
    <>
      <div className="relative overflow-hidden border-b border-stone-800" style={{ minHeight: 260 }}>
        <img
          src="https://images.pexels.com/photos/31342669/pexels-photo-31342669.jpeg?auto=compress&cs=tinysrgb&w=1600"
          style={{ objectPosition: 'center 40%' }}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-stone-900/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              Go outside with your pup
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              Find Dog-Friendly<br /><span className="text-emerald-400">Places Near You</span>
            </h1>
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              Off-leash parks, scenic trails, and dog-welcoming bars and restaurants, all in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-stone-900 border-b border-stone-800 sticky top-[104px] sm:top-[112px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => handleCityChange(city)}
                className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-sm transition-all ${
                  selectedCity === city ? 'bg-emerald-500 text-white' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${selectedCity}…`}
              className="w-full pl-8 pr-8 py-2.5 text-sm border border-stone-200 rounded bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {FILTER_TYPES.map(ft => {
              const count = ft.value ? (typeCounts[ft.value] ?? 0) : cityParks.length;
              return (
                <button
                  key={ft.value}
                  onClick={() => setTypeFilter(ft.value)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded border transition-all ${
                    typeFilter === ft.value
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'
                  }`}
                >
                  {ft.label}
                  <span className="ml-1.5 opacity-50 font-normal">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden lg:block max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex gap-5 items-start">
          <div className="w-[360px] xl:w-[400px] flex-shrink-0 bg-white border border-stone-200 overflow-hidden flex flex-col" style={{ minHeight: 600 }}>
            <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50 flex-shrink-0">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                {filtered.length} spot{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center flex-1 py-20">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-2 px-4">
                <Search className="w-8 h-8 text-stone-200" />
                <p className="text-sm font-semibold">No spots found</p>
              </div>
            ) : (
              <div className="overflow-y-auto">
                {filtered.map(p => (
                  <ParkListItem
                    key={p.id}
                    park={p}
                    isSelected={selectedPark?.id === p.id}
                    onClick={() => handleSelect(p)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 sticky top-[160px]" style={{ height: 'calc(100vh - 175px)' }}>
            <div className="relative w-full h-full border border-stone-200 overflow-hidden rounded-lg">
              <MapEmbed
                key={selectedCity}
                city={selectedCity}
                parks={filtered}
                selected={selectedPark}
                onSelect={handleSelect}
              />
              {selectedPark && (
                <MapOverlayCard park={selectedPark} onClose={() => setSelectedPark(null)} />
              )}
              {!selectedPark && !loading && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-full px-4 py-2 shadow-lg pointer-events-none">
                  <p className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Tap a pin to see details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden flex flex-col">
        <div className="bg-white border-b border-stone-200 flex">
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mobileView === 'map' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-stone-500'}`}
          >
            Map
          </button>
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mobileView === 'list' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-stone-500'}`}
          >
            List <span className="text-xs font-normal opacity-60 ml-1">{filtered.length}</span>
          </button>
        </div>

        {mobileView === 'map' && (
          <div className="relative" style={{ height: '70vh' }}>
            <MapEmbed
              key={selectedCity}
              city={selectedCity}
              parks={filtered}
              selected={selectedPark}
              onSelect={handleSelect}
            />
            {selectedPark && (
              <MobileBottomSheet park={selectedPark} onClose={() => setSelectedPark(null)} />
            )}
            {!selectedPark && !loading && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-full px-4 py-2 shadow-lg pointer-events-none">
                <p className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Tap a pin to see details
                </p>
              </div>
            )}
          </div>
        )}

        {mobileView === 'list' && (
          <div className="bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-2 px-4">
                <Search className="w-8 h-8 text-stone-200" />
                <p className="text-sm font-semibold">No spots found</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    {filtered.length} spot{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {filtered.map(p => (
                  <ParkListItem
                    key={p.id}
                    park={p}
                    isSelected={selectedPark?.id === p.id}
                    onClick={() => handleSelect(p)}
                  />
                ))}
                <div className="h-8" />
              </>
            )}
          </div>
        )}

        {mobileView === 'list' && selectedPark && (
          <div className="sticky bottom-0 bg-white border-t border-stone-200 px-4 py-3 flex gap-2">
            <button
              onClick={() => setMobileView('map')}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </button>
            <button
              onClick={() => setSelectedPark(null)}
              className="p-3 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
