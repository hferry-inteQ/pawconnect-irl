import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Heart, Share2, Check, ChevronRight, Twitter, Facebook, Link } from 'lucide-react';

type Step = 'form' | 'preview' | 'confirm';

interface FormData {
  yourName: string;
  yourAddress: string;
  propertyName: string;
  petStory: string;
}

const EMPTY: FormData = { yourName: '', yourAddress: '', propertyName: '', petStory: '' };

function PostcardPreview({ data }: { data: FormData }) {
  const story = data.petStory.trim() || 'My pet means the world to me.';
  const firstName = data.yourName.split(' ')[0] || 'A Resident';

  return (
    <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl border border-stone-200">
      <div className="bg-gradient-to-br from-sky-800 to-blue-900 text-white p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-amber-300 uppercase">Paw Connect by inteQ</p>
            <p className="text-2xl font-black leading-tight mt-0.5">
              Did your landlord pay<br />for your last vet visit?
            </p>
          </div>
          <div className="bg-amber-400 rounded-xl p-2.5 flex-shrink-0 shadow-lg">
            <Heart className="w-6 h-6 text-sky-900 fill-current" />
          </div>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-5 backdrop-blur-sm">
          <p className="text-sm text-sky-100 italic leading-relaxed">
            "{story}"
          </p>
          <p className="text-xs text-sky-300 mt-1.5 font-medium">— {firstName}</p>
        </div>

        <p className="text-sm text-sky-200 leading-relaxed mb-4">
          We think they should. That's why <span className="font-bold text-white">Paw Connect by inteQ</span> offers
          residents 24/7 vet telehealth, up to 80% off Rx, and 25%+ off vet visits — at no cost to you.
          Ask <span className="font-semibold text-amber-300">{data.propertyName || 'your property'}</span> to include it.
        </p>

        <div className="flex items-center gap-2 text-xs text-sky-300 border-t border-white/10 pt-4">
          <Mail className="w-3.5 h-3.5" />
          <span>inteq.com/pawconnect</span>
        </div>
      </div>

      <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex justify-between items-center gap-4">
        <div className="text-xs text-stone-500 leading-relaxed">
          <p className="font-semibold text-stone-700">{data.yourName || 'Your Name'}</p>
          <p>{data.yourAddress || 'Your Address'}</p>
        </div>
        <div className="text-right text-xs text-stone-400">
          <p className="font-semibold text-stone-600">{data.propertyName || 'Property / Landlord'}</p>
          <p className="italic">Your Community</p>
        </div>
      </div>
    </div>
  );
}

function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const msg = 'I just asked my landlord to add Paw Connect — free vet benefits for pet owners. You should too! 🐾';

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
      >
        <Twitter className="w-4 h-4" />
        Share on X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
      >
        <Facebook className="w-4 h-4" />
        Share on Facebook
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors border border-stone-200"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}

export default function WriteYourLandlord({ fullPage = false }: { fullPage?: boolean }) {
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

  function update(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function scrollToTop() {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goToPreview(e: React.FormEvent) {
    e.preventDefault();
    if (!form.yourName.trim() || !form.yourAddress.trim() || !form.propertyName.trim()) {
      setError('Please fill in your name, address, and property name.');
      return;
    }
    setError('');
    setStep('preview');
    setTimeout(scrollToTop, 50);
  }

  async function submit() {
    setSubmitting(true);
    setError('');
    const { error: dbError } = await (supabase.from('postcard_submissions') as ReturnType<typeof supabase.from>).insert({
      your_name: form.yourName.trim(),
      your_address: form.yourAddress.trim(),
      property_name: form.propertyName.trim(),
      pet_story: form.petStory.trim() || null,
    });
    setSubmitting(false);
    if (dbError) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setStep('confirm');
    setTimeout(scrollToTop, 50);
  }

  return (
    <section ref={sectionRef} className={`bg-stone-50 border-t border-stone-100 ${fullPage ? 'min-h-screen' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
            <Mail className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold tracking-widest text-amber-700 uppercase">Take 60 Seconds</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            Write Your Landlord
            <span className="block text-amber-600 text-2xl sm:text-3xl font-bold mt-1">
              We'll mail it for you.
            </span>
          </h2>
          <p className="text-stone-500 mt-4 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Did your landlord pay for your last vet visit? We think they should.
            Write them a postcard — it takes 60 seconds and might just change what your
            apartment community offers, starting with{' '}
            <span className="font-semibold text-sky-700">Paw Connect by inteQ</span>:
            24/7 telehealth, vet discounts, Rx savings, and more.
          </p>
        </div>

        {step === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <form onSubmit={goToPreview} className="space-y-5">
              <Field
                label="Your Name"
                required
                placeholder="Jane Smith"
                value={form.yourName}
                onChange={v => update('yourName', v)}
              />
              <Field
                label="Your Address"
                required
                placeholder="123 Main St, Apt 4B, Dallas TX 75201"
                value={form.yourAddress}
                onChange={v => update('yourAddress', v)}
              />
              <Field
                label="Property Name or Management Company"
                required
                placeholder="Riverside Commons / Lincoln Property Co."
                value={form.propertyName}
                onChange={v => update('propertyName', v)}
              />
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Tell us why you love your pet{' '}
                  <span className="font-normal text-stone-400">(optional — personalizes your postcard)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="My dog Luna has been my best friend for 7 years..."
                  value={form.petStory}
                  onChange={e => update('petStory', e.target.value)}
                  maxLength={200}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
                <p className="text-xs text-stone-400 mt-1 text-right">{form.petStory.length}/200</p>
              </div>

              {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">{error}</p>}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-6 py-4 rounded-xl text-base transition-colors shadow-md shadow-amber-200"
              >
                Preview My Postcard
                <ChevronRight className="w-5 h-5" />
              </button>

              <p className="text-xs text-stone-400 text-center leading-relaxed">
                This campaign is brought to you by <span className="font-semibold">inteQ</span>, makers of Paw Connect.
                We never sell your info.
              </p>
            </form>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider text-center">Live Preview</p>
              <PostcardPreview data={form} />
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Your Postcard</p>
              <PostcardPreview data={form} />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Looks good?</p>
              <p>Hit "Send It" and we'll mail this on your behalf. Your info stays private — we only use it to address your postcard.</p>
            </div>

            {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 border border-stone-200 hover:bg-stone-100 text-stone-600 font-semibold px-5 py-3.5 rounded-xl text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-amber-900 font-bold px-5 py-3.5 rounded-xl text-sm transition-colors shadow-md shadow-amber-200"
              >
                {submitting ? 'Sending...' : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send It — Mail My Postcard
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-stone-400 text-center">
              This campaign is brought to you by <span className="font-semibold">inteQ</span>, makers of Paw Connect.
              We never sell your info.
            </p>
          </div>
        )}

        {step === 'confirm' && (
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-emerald-100 rounded-full p-5">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-stone-900 mb-2">Your postcard is on its way!</h3>
              <p className="text-stone-500 text-base leading-relaxed">
                We received your submission and will mail your postcard to{' '}
                <span className="font-semibold text-stone-700">{form.propertyName}</span>.
                Every postcard we send is one step closer to making Paw Connect a standard resident benefit.
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-2xl px-6 py-5 space-y-3">
              <p className="font-bold text-sky-900 flex items-center gap-2 justify-center">
                <Share2 className="w-4 h-4" />
                Share this with a neighbor
              </p>
              <p className="text-sm text-sky-700">The more residents who ask, the more likely your community listens.</p>
              <ShareButtons />
            </div>

            <button
              onClick={() => { setForm(EMPTY); setStep('form'); }}
              className="text-sm text-stone-400 hover:text-stone-600 underline transition-colors"
            >
              Send another postcard
            </button>

            <p className="text-xs text-stone-400 leading-relaxed">
              This campaign is brought to you by <span className="font-semibold">inteQ</span>, makers of Paw Connect.
              We never sell your info.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1.5">
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
      />
    </div>
  );
}
