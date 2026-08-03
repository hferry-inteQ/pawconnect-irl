import { PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',             label: 'Events' },
  { to: '/adoption',     label: 'Adoption' },
  { to: '/deals',        label: 'Pet Deals' },
  { to: '/paw-connect',  label: 'Paw Connect' },
  { to: '/dog-parks',    label: 'Dog Parks, Etc.' },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-blue-700 text-white rounded-xl p-2.5 group-hover:bg-blue-600 transition-colors shadow-sm">
              <PawPrint className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-extrabold text-white text-base leading-tight tracking-tight">Paw Connect IRL</p>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">Real Events · Real Pets</p>
            </div>
          </Link>

          <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-sm">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="text-stone-500 hover:text-blue-300 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-600 mb-3">About inteQ</p>
            <p className="text-sm text-stone-400 leading-relaxed">
              inteQ helps residents and their pets live better lives. Through enrolled apartments, Paw Connect is a benefit
              program that includes 24/7 vet videochat, prescription savings, vet visits, and more. Don't live in an apartment
              offering Paw Connect?{' '}
              <Link to="/paw-connect" className="text-blue-400 hover:text-blue-300 transition-colors">
                Send them a postcard here.
              </Link>
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-600 mb-3">Resident Marketing</p>
            <p className="text-sm text-stone-400 leading-relaxed mb-4">
              Are you a multifamily operator looking for ways to sign more leases and keep residents happier? Let our team show you how we help. 30 mins. See how it works.
            </p>
            <a
              href="https://inteq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Learn about partnership opportunities
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-800 text-xs text-center text-stone-600 font-medium">
          &copy; {new Date().getFullYear()} Paw Connect IRL &mdash; Event listings sourced from public listings.
        </div>
      </div>
    </footer>
  );
}
