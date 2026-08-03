import { ShieldCheck, Phone, Pill, HeartPulse, ArrowRight, Lock } from 'lucide-react';

const BENEFITS = [
  { icon: <Phone className="w-5 h-5" />, title: '24/7 Vet Hotline', desc: 'Chat, call, or video with a licensed vet any time — day or night.' },
  { icon: <Pill className="w-5 h-5" />, title: 'Up to 80% off Rx', desc: 'Generic prescription medications at major pharmacy chains nationwide.' },
  { icon: <HeartPulse className="w-5 h-5" />, title: '25%+ off Vet Visits', desc: 'Exams, shots, and surgery at thousands of participating clinics.' },
];

export default function PawConnectCTA({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <section className={`bg-gradient-to-br from-sky-900 via-sky-800 to-blue-900 text-white ${fullPage ? 'min-h-screen' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-24">
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-400 text-sky-900 rounded-lg p-1.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">inteQ Resident Benefit</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-black leading-tight mb-4">
              Paw Connect<br />
              <span className="text-amber-400">for Multifamily</span>
            </h2>

            <p className="text-sky-200 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Paw Connect is included with select residential leases — no signup fee, no monthly cost.
              If your community partners with inteQ, your pet benefits are waiting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {BENEFITS.map(b => (
                <div key={b.title} className="flex items-start gap-3 bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-amber-400 flex-shrink-0 mt-0.5">{b.icon}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{b.title}</p>
                    <p className="text-sky-300 text-xs mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://inteq.com/pawconnect/login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-sky-900 font-bold px-6 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-400/20"
              >
                <Lock className="w-4 h-4" />
                Log in to Paw Connect
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://inteq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors"
              >
                Learn about inteQ
              </a>
            </div>

            <p className="text-sky-400 text-xs mt-4 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Residents only — your credentials are provided by your property management.
            </p>
          </div>

          <div className="flex-shrink-0 w-full lg:w-80">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm space-y-5">
              <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl p-5 text-sky-900 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Paw Connect</p>
                    <p className="font-black text-lg leading-tight">Member Benefits</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 opacity-80" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs opacity-60 uppercase tracking-wider">Included with your lease</p>
                  <p className="font-bold text-base">by inteQ</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ['24/7', 'Vet access'],
                  ['80%', 'Max Rx savings'],
                  ['25%+', 'Off vet visits'],
                  ['Free', 'Community events'],
                ].map(([val, label]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-sky-200">{label}</span>
                    <span className="font-bold text-amber-400">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
