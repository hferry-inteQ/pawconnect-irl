import OnlineDeals from '../components/OnlineDeals';
import { Tag } from 'lucide-react';

export default function DealsPage() {
  return (
    <>
      <div className="bg-stone-950 text-white border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-start gap-4">
            <div className="bg-amber-400 text-amber-900 p-2.5 mt-0.5 flex-shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-black tracking-widest text-amber-400 uppercase mb-1">Pet Care Deals</p>
              <h1 className="font-display text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                Best Pet Deals This Week
              </h1>
              <p className="text-stone-400 text-sm mt-1.5 max-w-xl leading-relaxed">
                Updated weekly from Amazon, Chewy, Petco, and top retailers.
              </p>
            </div>
          </div>
        </div>
      </div>
      <OnlineDeals hideHeader />
    </>
  );
}
