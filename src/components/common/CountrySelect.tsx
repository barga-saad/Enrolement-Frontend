import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { COUNTRIES, searchCountries, findCountryByCode } from '../../utils/countries';
import { useLangStore } from '../../utils/langStore';

interface CountrySelectProps {
  label: string;
  value: string;               // ISO code stored in form state
  onChange: (code: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  includeEmpty?: boolean;      // allow "- Aucun -" option
  emptyLabel?: string;
}

export const CountrySelect = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled,
  includeEmpty = false,
  emptyLabel,
}: CountrySelectProps) => {
  const { lang } = useLangStore();
  const isFr = lang === 'FR';

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value ? findCountryByCode(value) : null;
  const filtered = query ? searchCountries(query) : COUNTRIES;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="space-y-1.5 group" ref={containerRef}>
      <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 ml-0.5 transition-colors group-focus-within:text-bcp-brown dark:group-focus-within:text-bcp-orange-light">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger button */}
      <div className="relative">
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={`premium-input w-full text-left flex items-center justify-between pr-10 ${
            error ? '!border-red-400 dark:!border-red-500 !bg-red-50/40 dark:!bg-red-500/10' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-dark-bg' : 'cursor-pointer'}`}
        >
          {selected ? (
            <span className="flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold bg-orange-100 dark:bg-bcp-orange/20 text-bcp-orange">
                {selected.code}
              </span>
              <span className="text-sm">{isFr ? selected.nameFr : selected.nameEn}</span>
            </span>
          ) : (
            <span className="text-gray-400 text-sm">
              {emptyLabel ?? (isFr ? '- Sélectionner un pays -' : '- Select a country -')}
            </span>
          )}
        </button>

        {/* Right icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          {selected && includeEmpty && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="pointer-events-auto p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-72 max-w-full bg-white dark:bg-dark-bg-soft border border-gray-200/80 dark:border-dark-border rounded-xl shadow-bcp-medium overflow-hidden animate-fadeIn">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 dark:border-dark-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={isFr ? 'Rechercher un pays ou code ISO...' : 'Search country or ISO code...'}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:border-bcp-orange focus:ring-4 focus:ring-bcp-orange/15 text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Empty option */}
          {includeEmpty && (
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors border-b border-gray-100 dark:border-dark-border"
            >
              {emptyLabel ?? (isFr ? '- Aucun -' : '- None -')}
            </button>
          )}

          {/* Country list */}
          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400 text-center">
                {isFr ? 'Aucun résultat' : 'No results'}
              </p>
            ) : (
              filtered.map(c => {
                const name = isFr ? c.nameFr : c.nameEn;
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-bcp-orange/10 text-bcp-orange font-semibold'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-bg'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-9 h-5 rounded text-[10px] font-bold bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {c.code}
                    </span>
                    <span className="truncate">{name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400 ml-0.5 animate-fadeIn">{error}</p>}
    </div>
  );
};

/**
 * Returns the label for display-only contexts (consult/validate views).
 */
export function countryLabel(code: string, lang: string): string {
  if (!code) return '-';
  const c = findCountryByCode(code);
  if (!c) return code;
  return `${c.code} – ${lang === 'fr' ? c.nameFr : c.nameEn}`;
}
