'use client';

import { motion } from 'framer-motion';
import { categories, type CategoryId } from '@/lib/catalog';

export default function CategoryTabs({
  active,
  onChange,
}: {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Categorias do cardápio"
      className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
    >
      {categories.map((category) => {
        const selected = category.id === active;
        return (
          <button
            key={category.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(category.id)}
            className={`relative shrink-0 snap-start rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-200 ${
              selected ? 'text-ember' : 'text-white/85 hover:text-white'
            }`}
          >
            {selected && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_8px_22px_-8px_rgba(110,40,5,0.7)]"
              />
            )}
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
