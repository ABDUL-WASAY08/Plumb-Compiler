import { useLocation } from 'react-router-dom';
import { findNavItem } from '../app/navigation';

// The title block for the current route, so every page is clearly identified.
export default function PageHeader() {
  const { pathname } = useLocation();
  const item = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          {item.eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">{item.title}</h1>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{item.subtitle}</p>
      </div>
    </header>
  );
}
