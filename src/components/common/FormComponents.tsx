import React from 'react';
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';

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
        <div className="w-1.5 h-6 bg-bcp-orange rounded-full" />
        <h2 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 dark:text-dark-text-dim ml-[1.125rem]">{subtitle}</p>}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-gray-100 via-gray-100 to-transparent dark:from-dark-border dark:via-dark-border" />
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
    brown: 'bg-brown-50/50 dark:bg-bcp-brown/5 border-brown-100 dark:border-bcp-brown/10',
    gray: 'bg-gray-50/50 dark:bg-dark-bg-soft/50 border-gray-100 dark:border-dark-border',
  };

  return (
    <div className={`space-y-4 p-6 rounded-[2rem] border transition-all duration-300 ${bgClasses[bgColor]} ${className}`}>
      <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-bcp-orange" />
        <span>{title}</span>
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput = ({ label, required, error, icon, className, ...props }: FormInputProps) => (
  <div className="space-y-2 group">
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 transition-colors group-focus-within:text-bcp-orange">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bcp-orange transition-colors">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`premium-input ${icon ? 'pl-11' : 'pl-4'} ${
          error ? 'border-red-300 dark:border-red-500/30 focus:ring-red-500/10' : ''
        } ${props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-dark-bg' : ''} ${className}`}
      />
      {error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
          <AlertCircle className="w-5 h-5" />
        </div>
      )}
      {!error && props.value && !props.disabled && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}
    </div>
    {error && <p className="text-xs font-bold text-red-500 ml-1 animate-fadeIn">{error}</p>}
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
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
  className,
  ...props
}: FormSelectProps) => (
  <div className="space-y-2 group">
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 transition-colors group-focus-within:text-bcp-orange">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`premium-input appearance-none pr-10 ${
          error ? 'border-red-300 dark:border-red-500/30 focus:ring-red-500/10' : ''
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
    {error && <p className="text-xs font-bold text-red-500 ml-1 animate-fadeIn">{error}</p>}
  </div>
);

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
  <div className={`flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-bg-soft/50 border border-gray-100 dark:border-dark-border transition-all hover:border-bcp-orange/20 ${className}`}>
    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>
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
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} peer-focus:ring-4 peer-focus:ring-bcp-orange/20`}>
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
            checked ? 'translate-x-6 scale-110' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  </div>
);

