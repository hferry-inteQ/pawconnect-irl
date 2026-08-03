import { Star, CheckCircle, XCircle, ThumbsUp } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  brand: string;
  category: 'Auto Feeder' | 'Robot Litter Box';
  rating: number;
  price: string;
  summary: string;
  pros: string[];
  cons: string[];
  verdict: string;
  imageUrl: string;
  badge?: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'PetSafe Smart Feed 2.0',
    brand: 'PetSafe',
    category: 'Auto Feeder',
    rating: 4.6,
    price: '$149',
    summary: 'Wi-Fi enabled automatic feeder with a 24-cup hopper and app-controlled scheduling. Works reliably for kibble and supports up to 12 meals per day.',
    pros: ['Easy app setup', 'Reliable portion accuracy', 'Slow-feed mode', 'Works with Alexa'],
    cons: ['App UI is dated', 'No wet food support'],
    verdict: 'Best overall pick for most dog owners. Dependable hardware with solid app integration.',
    imageUrl: 'https://m.media-amazon.com/images/I/61p7MPYe5FL._AC_SX679_.jpg',
    badge: 'Best Overall',
  },
  {
    id: 2,
    name: 'WOPET Automatic Dog Feeder',
    brand: 'WOPET',
    category: 'Auto Feeder',
    rating: 4.3,
    price: '$69',
    summary: 'Budget-friendly feeder with 6-liter hopper, 6-meal scheduling, and a built-in 1080p camera.',
    pros: ['Built-in 1080p camera', 'Two-way audio', 'Strong value', 'Voice recording'],
    cons: ['Camera quality average at night', 'Less airtight hopper'],
    verdict: 'Great budget pick — especially if you want a camera without the premium price.',
    imageUrl: 'https://m.media-amazon.com/images/I/61daxas3LCL._AC_SX679_.jpg',
    badge: 'Best Value',
  },
  {
    id: 3,
    name: 'Arf Pets Automatic Feeder',
    brand: 'Arf Pets',
    category: 'Auto Feeder',
    rating: 4.1,
    price: '$55',
    summary: 'Simple, reliable feeder for single-pet households with 6-liter capacity and backup battery.',
    pros: ['Backup battery', 'Very quiet motor', 'Easy to clean'],
    cons: ['No Wi-Fi', 'Max 4 meals/day'],
    verdict: 'No-frills workhorse. Perfect if you want a feeder that just works.',
    imageUrl: 'https://arfpets.com/cdn/shop/products/NEWHERO2019dAmazonFinal_1335350f-7f37-4899-9f81-5092ad692c85_grande.jpg',
  },
  {
    id: 4,
    name: 'PETKIT SOLO Air',
    brand: 'PETKIT',
    category: 'Auto Feeder',
    rating: 4.5,
    price: '$119',
    summary: 'Premium Wi-Fi feeder with infrared food detection, portion logs, and nitrogen-flushing freshness seal.',
    pros: ['Freshness-sealed hopper', 'Detailed food logs', 'Up to 20 meals/day', 'Compact design'],
    cons: ['Requires account', 'Premium price'],
    verdict: 'Top pick for tech-forward owners who want detailed feeding data.',
    imageUrl: 'https://m.media-amazon.com/images/I/616LotB-n1L._AC_SX679_.jpg',
    badge: 'Best Tech',
  },
  {
    id: 5,
    name: 'PETKIT Purobot Ultra',
    brand: 'PETKIT',
    category: 'Robot Litter Box',
    rating: 4.5,
    price: '$449',
    summary: 'Self-cleaning robot litter box with app control, odor-sealing waste drawer, and multi-cat tracking.',
    pros: ['Quiet cleaning cycle', 'Multi-cat tracking', 'Excellent odor control', 'Safety sensors'],
    cons: ['Large footprint', 'Requires special litter'],
    verdict: 'Best for multi-cat households. Expensive but worth it for odor control.',
    imageUrl: 'https://www.petkit.com/cdn/shop/files/purobot-ultra-automatic-cat-litter-box-app-control-2-year-warranty.png',
    badge: "Editor's Pick",
  },
  {
    id: 6,
    name: 'Litter-Robot 4',
    brand: 'Whisker',
    category: 'Robot Litter Box',
    rating: 4.7,
    price: '$699',
    summary: 'The gold standard of robot litter boxes. OmniSense detection, automatic waste sealing, and health insights.',
    pros: ['Industry-leading reliability', 'Health tracking', 'Large opening', 'Excellent support'],
    cons: ['Very expensive', 'Bulky unit'],
    verdict: 'If budget isn\'t a concern, this is the undisputed best.',
    imageUrl: 'https://m.media-amazon.com/images/I/71EdQJ5H1VL._AC_SY300_SX300_QL70_ML2_.jpg',
    badge: 'Premium Pick',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`} />
      ))}
      <span className="text-xs font-bold text-stone-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductReviews({ hideHeader = false }: { hideHeader?: boolean }) {
  const feeders = REVIEWS.filter(r => r.category === 'Auto Feeder');
  const litterBoxes = REVIEWS.filter(r => r.category === 'Robot Litter Box');

  return (
    <section className="bg-stone-50 border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {!hideHeader && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1.5">
              <ThumbsUp className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-black tracking-widest text-amber-600 uppercase">Real Reviews</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Product Reviews</h2>
            <p className="text-stone-400 text-xs mt-1">Automatic feeders and smart litter boxes — tested by real pet owners.</p>
          </div>
        )}

        <ReviewGroup title="Auto Feeders" reviews={feeders} />
        <ReviewGroup title="Robot Litter Boxes" reviews={litterBoxes} className="mt-10" />
      </div>
    </section>
  );
}

function ReviewGroup({ title, reviews, className = '' }: { title: string; reviews: Review[]; className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-black text-stone-800 uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] font-bold text-stone-400 bg-stone-200 px-1.5 py-0.5">{reviews.length}</span>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {reviews.map(review => (
          <div
            key={review.id}
            className="flex-shrink-0 w-64 sm:w-auto bg-white border border-stone-150 overflow-hidden hover:border-stone-300 hover:shadow-md transition-all duration-200"
          >
            <div className="relative aspect-square overflow-hidden bg-stone-100">
              <img src={review.imageUrl} alt={review.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
              {review.badge && (
                <div className="absolute top-0 left-0 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 tracking-wider uppercase">
                  {review.badge}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">{review.brand}</p>
                <p className="text-white font-black text-sm leading-tight">{review.name}</p>
              </div>
            </div>

            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <span className="font-black text-stone-900 text-sm">{review.price}</span>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">{review.summary}</p>

              <div className="space-y-1">
                {review.pros.slice(0, 2).map(pro => (
                  <div key={pro} className="flex items-start gap-1.5 text-[11px] text-emerald-700">
                    <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-emerald-500" />
                    {pro}
                  </div>
                ))}
                {review.cons.slice(0, 1).map(con => (
                  <div key={con} className="flex items-start gap-1.5 text-[11px] text-rose-600">
                    <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-rose-400" />
                    {con}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border-l-2 border-amber-400 pl-2.5 pr-2 py-1.5">
                <p className="text-[11px] text-amber-800 font-semibold leading-snug">{review.verdict}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
