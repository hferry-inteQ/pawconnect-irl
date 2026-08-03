import { PawPrint, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',             label: 'Events',          end: true },
  { to: '/adoption',     label: 'Adoption',        end: false },
  { to: '/deals',        label: 'Pet Deals',       end: false },
  { to: '/paw-connect',  label: 'Paw Connect',     end: false },
  { to: '/dog-parks',    label: 'Dog Parks, Etc.', end: false },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-warm-200 sticky top-0 z-40 shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">

          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-blue-700 text-white p-2 rounded-xl group-hover:bg-blue-600 transition-all duration-200 shadow-sm">
              <PawPrint className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <span className="font-display font-black text-stone-900 text-lg sm:text-xl leading-none tracking-tight">Paw Connect IRL</span>
              <span className="hidden sm:block text-[10px] text-warm-500 font-semibold tracking-widest uppercase mt-0.5">Real Events · Real People</span>
            </div>
          </Link>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-warm-100 text-stone-600 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-warm-100 bg-white/98 py-2 px-4">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg text-sm font-semibold transition-colors mb-0.5 ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-stone-600 hover:bg-warm-100 hover:text-stone-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
