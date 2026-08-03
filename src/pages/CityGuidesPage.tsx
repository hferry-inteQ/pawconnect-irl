import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CityGuide, GuideSection, FeaturedSpot } from '../lib/city-guides.types';
import { MapPin, Dog, Utensils, TreePine, Clock, Thermometer, ExternalLink, ChevronRight, Loader2, BookOpen } from 'lucide-react';

const CITIES = ['Dallas', 'Fort Worth', 'Austin', 'Chicago', 'New Orleans'];

const ACCENT_CLASSES: Record<string, { badge: string; heading: string; tag: string; pill: string; border: string }> = {
  emerald: {
    badge:   'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    heading: 'text-emerald-400',
    tag:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    pill:    'bg-emerald-600',
    border:  'border-emerald-500',
  },
  amber: {
    badge:   'bg-amber-500/20 border-amber-500/30 text-amber-400',
    heading: 'text-amber-400',
    tag:     'bg-amber-50 text-amber-700 border-amber-200',
    pill:    'bg-amber-600',
    border:  'border-amber-500',
  },
  sky: {
    badge:   'bg-sky-500/20 border-sky-500/30 text-sky-400',
    heading: 'text-sky-400',
    tag:     'bg-sky-50 text-sky-700 border-sky-200',
    pill:    'bg-sky-600',
    border:  'border-sky-500',
  },
  blue: {
    badge:   'bg-blue-500/20 border-blue-500/30 text-blue-400',
    heading: 'text-blue-400',
    tag:     'bg-blue-50 text-blue-700 border-blue-200',
    pill:    'bg-blue-600',
    border:  'border-blue-500',
  },
  rose: {
    badge:   'bg-rose-500/20 border-rose-500/30 text-rose-400',
    heading: 'text-rose-400',
    tag:     'bg-rose-50 text-rose-700 border-rose-200',
    pill:    'bg-rose-600',
    border:  'border-rose-500',
  },
};

const SPOT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  dog_park:       { label: 'Dog Park',    icon: Dog,      color: 'text-emerald-600' },
  trail:          { label: 'Trail',       icon: TreePine, color: 'text-amber-600'   },
  bar_restaurant: { label: 'Bar / Rest.', icon: Utensils, color: 'text-rose-600'    },
};

const QUICK_FACT_ICONS: Record<string, React.ElementType> = {
  best_season:      Clock,
  avg_temp:         Thermometer,
  dog_parks:        Dog,
  dog_friendly_bars: Utensils,
  trails_miles:     TreePine,
  leash_law:        MapPin,
};

const QUICK_FACT_LABELS: Record<string, string> = {
  best_season:      'Best Season',
  avg_temp:         'Avg Temp',
  dog_parks:        'Dog Parks',
  dog_friendly_bars: 'Dog-Friendly Bars',
  trails_miles:     'Trail Miles',
  leash_law:        'Leash Law',
  water_stations:   'Water Stations',
  vet_emergency:    'Emergency Vet',
};

function QuickFactsCard({ facts, accent }: { facts: Record<string, string>; accent: string }) {
  const ac = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.emerald;
  return (
    <div className="bg-white border border-stone-200 divide-y divide-stone-100">
      <div className="px-4 py-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400">Quick Facts</h3>
      </div>
      {Object.entries(facts).map(([key, value]) => {
        const Icon = QUICK_FACT_ICONS[key];
        const label = QUICK_FACT_LABELS[key] ?? key.replace(/_/g, ' ');
        return (
          <div key={key} className="flex items-start gap-3 px-4 py-3">
            {Icon && <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${ac.heading}`} />}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 leading-none mb-0.5">{label}</p>
              <p className="text-xs text-stone-700 leading-snug">{value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeaturedSpotCard({ spot, accent }: { spot: FeaturedSpot; accent: string }) {
  const ac = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.emerald;
  const cfg = SPOT_TYPE_CONFIG[spot.type] ?? SPOT_TYPE_CONFIG.dog_park;
  const Icon = cfg.icon;
  return (
    <div className="group bg-white border border-stone-200 hover:border-stone-300 p-4 transition-all hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ac.tag}`}>
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-stone-900 leading-snug">{spot.name}</h4>
          <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${cfg.color}`}>{cfg.label}</p>
          {spot.address && (
            <p className="text-[11px] text-stone-400 mt-1 leading-tight">{spot.address}</p>
          )}
          {spot.tip && (
            <p className="text-xs text-stone-600 mt-2 leading-relaxed border-l-2 pl-2 border-stone-200 italic">
              {spot.tip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GuideSectionBlock({ section, index }: { section: GuideSection; index: number }) {
  const isEven = index % 2 === 0;
  return (
    <div className={`py-8 sm:py-10 border-b border-stone-100 last:border-0 ${isEven ? '' : 'bg-stone-50/50'}`}>
      <div className="max-w-4xl">
        {section.image_url ? (
          <div className={`flex flex-col ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'} gap-6 items-start`}>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg sm:text-xl font-black text-stone-900 leading-tight mb-3">
                {section.heading}
              </h3>
              <p className="text-stone-600 text-sm sm:text-[15px] leading-relaxed">{section.body}</p>
            </div>
            <div className="w-full sm:w-56 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={section.image_url}
                alt={section.heading}
                className="w-full h-40 sm:h-36 object-cover"
              />
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-display text-lg sm:text-xl font-black text-stone-900 leading-tight mb-3">
              {section.heading}
            </h3>
            <p className="text-stone-600 text-sm sm:text-[15px] leading-relaxed">{section.body}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GuideContent({ guide }: { guide: CityGuide }) {
  const ac = ACCENT_CLASSES[guide.accent_color] ?? ACCENT_CLASSES.emerald;
  const sections = guide.sections as GuideSection[];
  const spots = guide.featured_spots as FeaturedSpot[];
  const facts = guide.quick_facts as Record<string, string>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
              {guide.intro}
            </p>
          </div>

          {guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {guide.tags.map(t => (
                <span key={t} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${ac.tag}`}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="divide-y divide-stone-100 border-t border-stone-100">
            {sections.map((section, i) => (
              <GuideSectionBlock key={i} section={section} index={i} />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-48">
          <QuickFactsCard facts={facts} accent={guide.accent_color} />

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-3 px-1">
              Featured Spots
            </h3>
            <div className="space-y-2">
              {spots.map((spot, i) => (
                <FeaturedSpotCard key={i} spot={spot} accent={guide.accent_color} />
              ))}
            </div>
          </div>

          <a
            href="/dog-parks"
            className={`flex items-center justify-between w-full px-4 py-3.5 ${ac.pill} text-white text-sm font-bold rounded transition-opacity hover:opacity-90`}
          >
            <span>See all {guide.city} spots on the map</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </a>

          <p className="text-[11px] text-stone-400 text-center">
            Last updated {new Date(guide.last_updated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CityGuidesPage() {
  const [guides, setGuides] = useState<CityGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Dallas');

  useEffect(() => {
    supabase
      .from('city_guides')
      .select('*')
      .order('city')
      .then(({ data }) => {
        if (data) setGuides(data as CityGuide[]);
        setLoading(false);
      });
  }, []);

  const activeGuide = guides.find(g => g.city === selectedCity) ?? null;
  const ac = activeGuide ? (ACCENT_CLASSES[activeGuide.accent_color] ?? ACCENT_CLASSES.emerald) : ACCENT_CLASSES.emerald;

  return (
    <>
      <div className="bg-stone-950 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-start gap-4">
            <div className="bg-violet-500/20 border border-violet-500/30 p-2.5 mt-0.5 flex-shrink-0 rounded">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-[11px] font-black tracking-widest text-violet-400 uppercase mb-1">City Guides</p>
              <h1 className="font-display text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                Dog Owner's Guide to Every City
              </h1>
              <p className="text-stone-400 text-sm mt-1.5 max-w-xl leading-relaxed">
                Neighborhoods, parks, trails, bars, and insider tips — everything a dog owner needs to navigate each city.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-stone-900 border-b border-stone-800 sticky top-[104px] sm:top-[112px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {CITIES.map(city => {
              const guide = guides.find(g => g.city === city);
              const isActive = city === selectedCity;
              const cityAc = guide ? (ACCENT_CLASSES[guide.accent_color] ?? ACCENT_CLASSES.emerald) : ACCENT_CLASSES.emerald;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-sm transition-all whitespace-nowrap ${
                    isActive
                      ? `${cityAc.pill} text-white`
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
        </div>
      ) : !activeGuide ? (
        <div className="flex flex-col items-center justify-center py-32 text-stone-400 gap-3">
          <BookOpen className="w-10 h-10 text-stone-200" />
          <p className="text-base font-bold text-stone-500">Guide not found</p>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden" style={{ height: 280 }}>
            <img
              src={activeGuide.hero_image_url}
              alt={activeGuide.city}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent" />
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
              <span className={`inline-flex items-center gap-2 border text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit ${ac.badge}`}>
                {activeGuide.state} — Dog Owner's Guide
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {activeGuide.city}
              </h2>
              <p className={`text-base sm:text-lg font-semibold mt-1 ${ac.heading}`}>
                {activeGuide.tagline}
              </p>
            </div>
          </div>

          <GuideContent guide={activeGuide} />
        </>
      )}
    </>
  );
}
