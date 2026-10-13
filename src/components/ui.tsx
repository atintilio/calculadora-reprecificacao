import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className="relative group inline-block">
      {children}
      <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg w-64 text-center">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </span>
  );
}

interface DisclaimerProps {
  text: string;
  type?: 'warning' | 'info';
}

export function Disclaimer({ text, type = 'info' }: DisclaimerProps) {
  const bgColor = type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
  const textColor = type === 'warning' ? 'text-amber-800' : 'text-blue-800';
  const icon = type === 'warning' ? '⚠️' : 'ℹ️';
  
  return (
    <div className={`${bgColor} border rounded-lg p-3 flex items-start gap-2 text-sm ${textColor}`}>
      <span className="flex-shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: 'positive' | 'negative' | 'neutral' | 'highlight';
}

export function Metric({ label, value, sublabel, variant = 'neutral' }: MetricProps) {
  const colors = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-gray-800',
    highlight: 'text-indigo-600',
  };
  
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${colors[variant]} mt-1`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function InputField({ label, value, onChange, suffix, prefix, tooltip, min = 0, max, step }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label}
        {tooltip && (
          <Tooltip text={tooltip}>
            <span className="cursor-help text-gray-400 hover:text-gray-600">ⓘ</span>
          </Tooltip>
        )}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step || 0.01}
          className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
