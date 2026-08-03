import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { EventWithRelations, CityRow, CategoryRow } from '../lib/database.types';
import Hero from '../components/Hero';
import FilterBar, { type DateQuickFilter } from '../components/FilterBar';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import CityGrid from '../components/CityGrid';
import OnlineDeals from '../components/OnlineDeals';
import PawConnectCTA from '../components/PawConnectCTA';
import WriteYourLandlord from '../components/WriteYourLandlord';
import { Loader2, Search } from 'lucide-react';

function getDateRange(filter: DateQuickFilter): [Date, Date] | null {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (filter === 'today') {
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }
  if (filter === 'this-week') {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }
  if (filter === 'this-weekend') {
    const day = now.getDay();
    const diffToSat = day === 6 ? 0 : (6 - day);
    const satStart = new Date(start);
    satStart.setDate(start.getDate() + diffToSat);
    const sunEnd = new Date(satStart);
    sunEnd.setDate(satStart.getDate() + 1);
    sunEnd.setHours(23, 59, 59, 999);
    return [satStart, sunEnd];
  }
  if (filter === 'this-month') {
    const end = new Date(start);
    end.setDate(start.getDate() + 29);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }
  return null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateQuickFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventWithRelations | null>(null);

  useEffect(() => {
    async function load() {
      const [eventsRes, citiesRes, categoriesRes] = await Promise.all([
        supabase.from('events').select('*, cities(*), event_categories(*)').order('event_date', { ascending: true }),
        supabase.from('cities').select('*').order('name'),
        supabase.from('event_categories').select('*').order('name'),
      ]);
      if (eventsRes.data) setEvents(eventsRes.data as EventWithRelations[]);
      if (citiesRes.data) setCities(citiesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const dateRange = getDateRange(dateFilter);
    return events.filter(e => {
      if (selectedCity && e.city_id !== selectedCity) return false;
      if (selectedCategory && e.category_id !== selectedCategory) return false;
      if (showFreeOnly && !e.is_free) return false;
      if (dateRange) {
        const d = new Date(e.event_date);
        if (d < dateRange[0] || d > dateRange[1]) return false;
      }
      if (q) {
        const haystack = [e.title, e.description, e.location_name, e.organizer_name, e.cities?.name ?? '', e.event_categories?.name ?? '', ...e.tags].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, searchQuery, selectedCity, selectedCategory, showFreeOnly, dateFilter]);

  const eventCountByCity = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      if (e.city_id) counts[e.city_id] = (counts[e.city_id] ?? 0) + 1;
    }
    return counts;
  }, [events]);

  function clearAllFilters() {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedCategory('');
    setShowFreeOnly(false);
    setDateFilter('all');
  }

  function handleCitySelect(cityId: string) {
    setSelectedCity(cityId);
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} events={events} />

      <FilterBar
        cities={cities}
        categories={categories}
        selectedCity={selectedCity}
        selectedCategory={selectedCategory}
        showFreeOnly={showFreeOnly}
        dateFilter={dateFilter}
        onCityChange={setSelectedCity}
        onCategoryChange={setSelectedCategory}
        onFreeOnlyChange={setShowFreeOnly}
        onDateFilterChange={setDateFilter}
        resultCount={filteredEvents.length}
      />

      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-5">
          <h2 className="font-display text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Upcoming Events</h2>
          <p className="text-warm-500 text-xs mt-1 font-semibold uppercase tracking-widest">Public meetups, park days, hikes &amp; more</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Search className="w-10 h-10 text-stone-200" />
            <p className="text-base font-bold text-stone-500">No events found</p>
            <p className="text-sm text-stone-400">Try adjusting your filters.</p>
            <button onClick={clearAllFilters} className="mt-1 bg-stone-900 hover:bg-stone-700 text-white font-bold text-sm px-4 py-2 transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
            ))}
          </div>
        )}
      </section>

      {!loading && (
        <CityGrid cities={cities} eventCountByCity={eventCountByCity} onCitySelect={handleCitySelect} />
      )}

      <div id="deals">
        <SectionDivider label="Pet Deals" />
        <OnlineDeals />
      </div>

      <div id="paw-connect">
        <SectionDivider label="Paw Connect for Multifamily" dark />
        <PawConnectCTA />
      </div>

      <div id="write-landlord">
        <SectionDivider label="Write Your Landlord" />
        <WriteYourLandlord />
      </div>

      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}

function SectionDivider({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div className={`border-t ${dark ? 'border-sky-900 bg-sky-950' : 'border-warm-100 bg-warm-50'} px-4 sm:px-6 lg:px-8 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-sky-400' : 'text-warm-500'}`}>
          {label}
        </span>
        <div className={`flex-1 h-px ${dark ? 'bg-sky-800' : 'bg-warm-200'}`} />
      </div>
    </div>
  );
}
