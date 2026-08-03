import ProductReviews from '../components/ProductReviews';

export default function ReviewsPage() {
  return (
    <>
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              Gear Guide
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight mb-4">
              Pet Tech Reviews<br /><span className="text-amber-400">for Smart Owners</span>
            </h1>
            <p className="text-stone-300 text-lg leading-relaxed max-w-xl">
              Honest reviews of automatic feeders and smart litter boxes — the tech that makes pet life easier.
            </p>
          </div>
        </div>
      </div>
      <ProductReviews hideHeader />
    </>
  );
}
