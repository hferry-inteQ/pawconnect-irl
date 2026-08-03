import { ArrowUpRight } from 'lucide-react';
import type { CityRow } from '../lib/database.types';

const cityImages: Record<string, string> = {
  austin:        'https://images.pexels.com/photos/1436198/pexels-photo-1436198.jpeg',
  dallas:        'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg',
  'fort-worth':  'https://images.pexels.com/photos/2570063/pexels-photo-2570063.jpeg',
  chicago:       'https://images.pexels.com/photos/1769408/pexels-photo-1769408.jpeg',
  'new-orleans': 'https://images.pexels.com/photos/2224861/pexels-photo-2224861.jpeg',
};

const cityAccent: Record<string, string> = {
  austin:        'from-amber-500',
  dallas:        'from-sky-500',
  'fort-worth':  'from-emerald-500',
  chicago:       'from-rose-500',
  'new-orleans': 'from-fuchsia-500',
};

const cityState: Record<string, string> = {
  austin:        'Texas',
  dallas:        'Texas',
  'fort-worth':  'Texas',
  chicago:       'Illinois',
  'new-orleans': 'Louisiana',
};

interface Props {
  cities: CityRow[];
  eventCountByCity: Record<string, number>;
  onCitySelect: (cityId: string) => void;
}

export default function CityGrid({ cities, eventCountByCity, onCitySelect }: Props) {
  return (
    <section id="cities" className="bg-stone-950 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-stone-500 uppercase mb-2">Coverage</p>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              Browse by City
            </h2>
          </div>
          <p className="text-xs text-stone-600 font-semibold hidden sm:block pb-1">
            {cities.length} cities &amp; growing
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-stone-800">
          {cities.map((city, i) => {
            const count = eventCountByCity[city.id] ?? 0;
            const img = cityImages[city.slug] ?? cityImages.austin;
            const accent = cityAccent[city.slug] ?? 'from-amber-500';
            const isWide = cities.length % 2 !== 0 && i === cities.length - 1;

            return (
              <button
                key={city.id}
                onClick={() => onCitySelect(city.id)}
                className={`group relative overflow-hidden bg-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${isWide ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={img}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest text-stone-400 uppercase">
                        <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                        {count} event{count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight group-hover:text-amber-50 transition-colors">
                      {city.name}
                    </h3>

                    <p className="text-[11px] font-semibold text-stone-500 mt-1 tracking-widest uppercase group-hover:text-stone-400 transition-colors">
                      {cityState[city.slug] ?? 'USA'}
                    </p>
                  </div>

                  <div className="absolute top-3 right-3 w-7 h-7 bg-white/0 group-hover:bg-white/10 border border-white/0 group-hover:border-white/20 flex items-center justify-center transition-all duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/0 group-hover:text-white/70 transition-all duration-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
