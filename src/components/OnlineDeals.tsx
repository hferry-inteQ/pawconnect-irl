import { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, ExternalLink, Zap, Clock, ShieldCheck, Tag, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PetDeal } from '../lib/database.types';

const CATEGORIES = ['All', 'Food', 'Toys', 'Gear', 'Health', 'Grooming', 'Tech', 'Home', 'Subscription'];
const SORT_OPTIONS = [
  { value: 'votes', label: 'Most Popular' },
  { value: 'posted_at', label: 'Newest' },
  { value: 'discount_pct', label: 'Biggest Discount' },
  { value: 'price', label: 'Lowest Price' },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function VoteButton({ votes }: { votes: number }) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(votes);
  return (
    <button
      onClick={e => { e.preventDefault(); if (!voted) { setVoted(true); setCount(c => c + 1); } else { setVoted(false); setCount(c => c - 1); } }}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 border transition-all ${voted ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-stone-200 text-stone-500 hover:border-amber-300 hover:text-amber-600'}`}
    >
      <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-amber-400 text-amber-600' : ''}`} />
      <span className="text-xs font-black leading-none">{count}</span>
    </button>
  );
}

const STORE_COLORS: Record<string, string> = {
  Amazon:   '#f97316',
  BarkBox:  '#059669',
  Chewy:    '#1d4ed8',
  Petco:    '#0d9488',
  PetSmart: '#dc2626',
  REI:      '#15803d',
  Walmart:  '#3b82f6',
};

function StoreBadge({ store }: { store: string }) {
  const bg = STORE_COLORS[store] ?? '#57534e';
  return (
    <span style={{ backgroundColor: bg }} className="text-white text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wider">
      {store}
    </span>
  );
}

export default function OnlineDeals({ hideHeader = false }: { hideHeader?: boolean }) {
  const [deals, setDeals] = useState<PetDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'votes' | 'posted_at' | 'discount_pct' | 'price'>('votes');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function fetchDeals() {
    setLoading(true);
    let query = supabase
      .from('pet_deals')
      .select('*')
      .eq('is_expired', false)
      .order(sortBy, { ascending: sortBy === 'price' });

    if (category !== 'All') query = query.eq('category', category);

    const { data } = await query;
    if (data) setDeals(data as PetDeal[]);
    setLastRefresh(new Date());
    setLoading(false);
  }

  useEffect(() => { fetchDeals(); }, [category, sortBy]);

  const featuredDeals = deals.filter(d => d.is_featured);
  const regularDeals = deals.filter(d => !d.is_featured);

  return (
    <section className="bg-white border-t border-stone-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {!hideHeader && (
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-[11px] font-black tracking-widest text-amber-600 uppercase">Live Deals</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Pet Care Deals</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-1">
              <RefreshCw className="w-3 h-3" />
              <span>Updated {timeAgo(lastRefresh.toISOString())}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mb-5">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 border transition-all ${
                  category === cat
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">{deals.length} active deal{deals.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 hidden sm:block">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-stone-200 bg-white text-stone-700 font-semibold px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-8 h-8 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 font-semibold">No deals in this category right now.</p>
          </div>
        ) : (
          <div className="space-y-0 border border-stone-150 divide-y divide-stone-100">
            {featuredDeals.length > 0 && featuredDeals.map(deal => (
              <DealRow key={deal.id} deal={deal} featured />
            ))}
            {regularDeals.map(deal => (
              <DealRow key={deal.id} deal={deal} />
            ))}
          </div>
        )}

        <p className="text-xs text-stone-400 text-center mt-6 leading-relaxed">
          Deals are verified and updated weekly. Prices subject to change — always confirm before purchasing.
          <span className="mx-1.5">·</span>
          <ShieldCheck className="w-3 h-3 inline-block" /> Affiliate links may apply.
        </p>
      </div>
    </section>
  );
}

function DealRow({ deal, featured = false }: { deal: PetDeal; featured?: boolean }) {
  const expiresIn = deal.expires_at ? Math.floor((new Date(deal.expires_at).getTime() - Date.now()) / 3600000) : null;
  const expiringSoon = expiresIn !== null && expiresIn < 24;

  return (
    <a
      href={deal.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex gap-0 hover:bg-stone-50 transition-colors group ${featured ? 'bg-amber-50/40' : 'bg-white'}`}
    >
      <div className="flex-shrink-0 flex items-start pt-3 pl-3 pr-2" onClick={e => e.stopPropagation()}>
        <VoteButton votes={deal.votes} />
      </div>

      <div className="flex-shrink-0 w-20 sm:w-28 self-stretch overflow-hidden bg-stone-100 m-3 ml-0">
        <img
          src={deal.image_url}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <StoreBadge store={deal.store} />
        </div>

        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
          {deal.title}
        </h3>

        <p className="text-xs text-stone-500 leading-relaxed line-clamp-1 hidden sm:block">
          {deal.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <span className="text-base sm:text-lg font-black text-stone-900">{deal.price_text}</span>
          {deal.original_price_text && (
            <span className="text-sm text-stone-400 line-through font-medium">{deal.original_price_text}</span>
          )}
          {deal.discount_label && (
            <span className="text-xs font-black text-white bg-rose-500 px-2 py-0.5">
              {deal.discount_label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-0.5">
          <span className="font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5">{deal.category}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(deal.posted_at)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {deal.comment_count}
          </span>
          {expiringSoon && expiresIn !== null && (
            <span className="text-rose-500 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expires in {expiresIn}h
            </span>
          )}
          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      </div>
    </a>
  );
}
