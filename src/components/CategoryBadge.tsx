import type { CategoryRow } from '../lib/database.types';

const colorMap: Record<string, string> = {
  green:   'bg-green-600 text-white',
  amber:   'bg-amber-500 text-white',
  orange:  'bg-orange-500 text-white',
  sky:     'bg-sky-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  blue:    'bg-blue-600 text-white',
  rose:    'bg-rose-600 text-white',
  yellow:  'bg-yellow-500 text-white',
};

interface Props {
  category: CategoryRow;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const classes = colorMap[category.color] ?? 'bg-stone-600 text-white';
  const padding = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center font-bold tracking-widest uppercase ${classes} ${padding}`}>
      {category.name}
    </span>
  );
}
