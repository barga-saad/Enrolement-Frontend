import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({ title, subtitle, children, className }: FormSectionProps) => (
  <div className={`space-y-6 ${className}`}>
    <div className="relative pb-4">
      <div className="flex items-center space-x-3 mb-1">
        <div className="w-1 h-5 bg-gradient-to-b from-bcp-orange to-bcp-brown rounded-full" />
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 dark:text-dark-text-dim ml-4">{subtitle}</p>}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-dark-border dark:via-dark-border" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

interface FormBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  bgColor?: 'orange' | 'brown' | 'gray';
}

export const FormBlock = ({ title, children, className, bgColor = 'gray' }: FormBlockProps) => {
  const bgClasses = {
    orange: 'bg-orange-50/50 dark:bg-bcp-orange/5 border-orange-100 dark:border-bcp-orange/10',
    brown: 'bg-brown-50/60 dark:bg-bcp-brown/5 border-brown-100 dark:border-bcp-brown/10',
    gray: 'bg-gray-50/60 dark:bg-dark-bg-soft/50 border-gray-200/70 dark:border-dark-border',
  };

  return (
    <div className={`space-y-4 p-5 sm:p-6 rounded-2xl border transition-colors duration-300 ${bgClasses[bgColor]} ${className}`}>
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-bcp-orange ring-4 ring-bcp-orange/15" />
        <span>{title}</span>
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput = ({ label, required, error, icon, className = '', ...props }: FormInputProps) => (
  <div className="space-y-1.5 group">
    {label && (
      <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 ml-0.5 transition-colors group-focus-within:text-bcp-brown dark:group-focus-within:text-bcp-orange-light">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors">
          {icon}
        </div>
      )}
      <input
        aria-invalid={error ? true : undefined}
        {...props}
        className={`premium-input ${icon ? 'pl-11' : 'pl-4'} ${error ? 'pr-10' : ''} ${
          error ? '!border-red-400 dark:!border-red-500 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''
        } ${props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-dark-bg' : ''} ${className}`}
      />
      {error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
          <AlertCircle className="w-4 h-4" />
        </div>
      )}
    </div>
    {error && (
      <p className="text-xs font-medium text-red-600 dark:text-red-400 ml-0.5 flex items-center gap-1 animate-fadeIn">
        <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
      </p>
    )}
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect = ({
  label,
  required,
  error,
  options,
  placeholder,
  className = '',
  ...props
}: FormSelectProps) => (
  <div className="space-y-1.5 group">
    {label && (
      <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 ml-0.5 transition-colors group-focus-within:text-bcp-brown dark:group-focus-within:text-bcp-orange-light">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        {...props}
        className={`premium-input appearance-none pr-10 ${
          error ? '!border-red-400 dark:!border-red-500 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''
        } ${props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-dark-bg' : ''} ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-bcp-orange transition-colors">
        <ChevronDown className="w-5 h-5" />
      </div>
    </div>
    {error && (
      <p className="text-xs font-medium text-red-600 dark:text-red-400 ml-0.5 flex items-center gap-1 animate-fadeIn">
        <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
      </p>
    )}
  </div>
);

interface SearchableSelectProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const SearchableSelect = ({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = '-- Choisir --',
  error,
}: SearchableSelectProps) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-1.5 group" ref={containerRef}>
      {label && (
        <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 ml-0.5 transition-colors group-focus-within:text-bcp-brown dark:group-focus-within:text-bcp-orange-light">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          autoComplete="off"
          value={open ? search : (selected?.label || '')}
          onFocus={() => { setOpen(true); setSearch(''); }}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className={`premium-input pr-10 ${
            error ? '!border-red-400 dark:!border-red-500 !bg-red-50/40 dark:!bg-red-500/10 focus:!border-red-500 focus:!ring-red-500/15' : ''
          }`}
        />
        <ChevronDown
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
        />
        {open && (
          <div className="absolute z-50 w-full top-full mt-1.5 p-1 bg-white dark:bg-dark-bg-card border border-gray-200/80 dark:border-dark-border rounded-xl shadow-bcp-medium max-h-56 overflow-y-auto custom-scrollbar animate-fadeIn">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">Aucun résultat</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onMouseDown={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${o.value === value
                      ? 'bg-orange-50 dark:bg-bcp-orange/10 text-bcp-orange font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-bcp-orange/10 hover:text-bcp-orange'
                    }`}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400 ml-0.5 flex items-center gap-1 animate-fadeIn">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

interface FormToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const FormToggleRow = ({
  label,
  checked,
  onChange,
  disabled,
  className,
}: FormToggleRowProps) => (
  <div className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-gray-50/60 dark:bg-dark-bg-soft/50 border border-gray-200/70 dark:border-dark-border transition-colors hover:border-bcp-orange/30 ${className}`}>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
        checked ? 'bg-bcp-orange' : 'bg-gray-300 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} peer-focus-visible:ring-4 peer-focus-visible:ring-bcp-orange/25`}>
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
            checked ? 'translate-x-6 scale-110' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  </div>
);

