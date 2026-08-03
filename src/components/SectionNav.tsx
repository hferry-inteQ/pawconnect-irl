import { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, ChevronRight, Heart, Tag, TreePine } from 'lucide-react';

const SECTIONS = [
  { to: '/dog-parks',   icon: TreePine,     label: 'Dog Parks, Etc.', accent: 'bg-teal-600 text-white'     },
  { to: '/',            icon: CalendarDays, label: 'Events',          accent: 'bg-blue-500 text-white'     },
  { to: '/adoption',    icon: Heart,        label: 'Adoption',        accent: 'bg-rose-500 text-white'     },
  { to: '/deals',       icon: Tag,          label: 'Deals',           accent: 'bg-emerald-600 text-white'  },
  { to: '/city-guides', icon: BookOpen,     label: 'City Guides',     accent: 'bg-violet-600 text-white'   },
];

export default function SectionNav() {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowArrow(el.scrollWidth > el.clientWidth && el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    check();
    el.addEventListener('scroll', check);
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  return (
    <div className="bg-[#0c1f3f] border-b border-[#162e5a]/80 sticky top-16 sm:top-[72px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide gap-0.5 py-2 -mx-1 px-1">
          {SECTIONS.map(s => {
            const isActive = pathname === s.to;
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`
                  relative flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg
                  text-xs font-semibold transition-all duration-150 whitespace-nowrap
                  ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-blue-200/60 hover:text-blue-100 hover:bg-white/5'}
                `}
              >
                <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${isActive ? s.accent : 'bg-[#1a3560]'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span>{s.label}</span>
              </Link>
            );
          })}
        </div>
        {showArrow && (
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 flex items-center pr-1">
            <div className="bg-gradient-to-l from-[#0c1f3f] via-[#0c1f3f]/80 to-transparent w-10 h-full flex items-center justify-end">
              <ChevronRight className="w-4 h-4 text-blue-200/60 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
