import { Plus } from 'lucide-react';
import type { MenuItem } from '@/types';
import { useLanguage } from '@/i18n/useLanguage';

interface ItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function ItemCard({ item, onAdd }: ItemCardProps) {
  const { formatPrice } = useLanguage();

  return (
    <button
      onClick={() => onAdd(item)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:ring-2 hover:ring-emerald-500/40 transition-all duration-200 text-start"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <span className="text-3xl">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute bottom-2 start-2 rounded-full bg-emerald-500 p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {item.description}
          </p>
        )}
        <p className="mt-auto text-base font-bold text-emerald-600 dark:text-emerald-400">
          {formatPrice(item.price)}
        </p>
      </div>
    </button>
  );
}
