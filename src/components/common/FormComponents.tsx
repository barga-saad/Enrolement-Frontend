/**
 * Form Components
 * Reusable form building blocks
 */

import React from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({ title, subtitle, children, className }: FormSectionProps) => (
  <div className={`space-y-4 ${className}`}>
    <div className="border-b-2 border-cyan-700 pb-2">
      <h2 className="font-bold text-lg text-cyan-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
    {children}
  </div>
);

interface FormBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  bgColor?: 'blue' | 'gray';
}

export const FormBlock = ({ title, children, className, bgColor = 'blue' }: FormBlockProps) => (
  <div className={`space-y-4 p-4 rounded-md ${bgColor === 'blue' ? 'bg-blue-50' : 'bg-gray-50'} ${className}`}>
    <h3 className={`font-semibold border-b pb-2 ${bgColor === 'blue' ? 'text-blue-800' : 'text-gray-800'}`}>
      {title}
    </h3>
    {children}
  </div>
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export const FormInput = ({ label, required, error, className, ...props }: FormInputProps) => (
  <div className="space-y-1">
    <label className={`block text-sm font-medium ${required ? 'text-red-600' : 'text-gray-700'}`}>
      {label} {required && '*'}
    </label>
    <input
      {...props}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      } ${props.disabled ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''} ${className}`}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
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
  <div className="space-y-1">
    <label className={`block text-sm font-medium ${required ? 'text-red-600' : 'text-gray-700'}`}>
      {label} {required && '*'}
    </label>
    <select
      {...props}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      } ${props.disabled ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''} ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
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
  <div className={`flex items-center justify-between py-2 ${className}`}>
    <span className="text-sm text-gray-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 rounded-full peer transition-colors ${
        checked ? 'bg-cyan-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  </div>
);
