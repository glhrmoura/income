import { useState, type ReactNode } from 'react';

interface MoneyInputProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
}

interface PercentInputProps {
  label: string;
  hint?: ReactNode;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  suffix?: ReactNode;
}

function centsToDisplay(cents: string, maxDigits = 13): string {
  const digits = cents.replace(/\D/g, '').slice(0, maxDigits);
  if (!digits) return '';
  const n = Number(digits);
  const reais = Math.floor(n / 100);
  const centavos = n % 100;
  return `${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`;
}

function displayToCents(display: string): string {
  const digits = display.replace(/\D/g, '');
  return digits.replace(/^0+(?=\d)/, '');
}

function selectAll(input: HTMLInputElement) {
  requestAnimationFrame(() => input.select());
}

export function MoneyInput({ label, hint, value, onChange, invalid }: MoneyInputProps) {
  const [display, setDisplay] = useState(() =>
    value > 0 ? centsToDisplay(String(Math.round(value * 100))) : '',
  );
  const [focused, setFocused] = useState(false);

  const shown = focused ? display : display || (value > 0 ? centsToDisplay(String(Math.round(value * 100))) : '');

  const handleChange = (raw: string) => {
    const cents = displayToCents(raw);
    setDisplay(centsToDisplay(cents));
    const numeric = Number(cents) / 100;
    onChange(Number.isFinite(numeric) ? numeric : 0);
  };

  return (
    <label className="block">
      <span className="block text-sm font-medium text-graphite-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-graphite-400">{hint}</span>}
      <div
        className={`mt-2 flex items-baseline border-b pb-1.5 transition-colors ${
          invalid
            ? 'border-alert-500'
            : focused
              ? 'border-forest-600'
              : 'border-graphite-200'
        }`}
      >
        <span className="mr-1 select-none text-base text-graphite-400">R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={shown}
          placeholder="0,00"
          onFocus={(e) => {
            setFocused(true);
            selectAll(e.currentTarget);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-transparent text-xl text-graphite-900 outline-none placeholder:text-graphite-300 tabular-nums"
        />
      </div>
    </label>
  );
}

const PERCENT_DIGITS = 5;

export function PercentInput({ label, hint, value, onChange, invalid, suffix }: PercentInputProps) {
  const [display, setDisplay] = useState(() =>
    value > 0 ? centsToDisplay(String(Math.round(value * 100)), PERCENT_DIGITS) : '',
  );
  const [focused, setFocused] = useState(false);

  const shown = focused
    ? display
    : display || (value > 0 ? centsToDisplay(String(Math.round(value * 100)), PERCENT_DIGITS) : '');

  const handleChange = (raw: string) => {
    const cents = displayToCents(raw).slice(0, PERCENT_DIGITS);
    setDisplay(centsToDisplay(cents, PERCENT_DIGITS));
    const numeric = Number(cents) / 100;
    onChange(Number.isFinite(numeric) ? numeric : 0);
  };

  return (
    <label className="block">
      <span className="block text-sm font-medium text-graphite-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-graphite-400">{hint}</span>}
      <div
        className={`mt-2 flex items-baseline border-b pb-1.5 transition-colors ${
          invalid
            ? 'border-alert-500'
            : focused
              ? 'border-forest-600'
              : 'border-graphite-200'
        }`}
      >
        <input
          type="text"
          inputMode="numeric"
          value={shown}
          placeholder="0,00"
          onFocus={(e) => {
            setFocused(true);
            selectAll(e.currentTarget);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-transparent text-xl text-graphite-900 outline-none placeholder:text-graphite-300 tabular-nums"
        />
        <span className="ml-1 select-none text-base text-graphite-400">%</span>
        {suffix && <span className="ml-4 self-center">{suffix}</span>}
      </div>
    </label>
  );
}

interface SwitchProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ label, hint, checked, onChange }: SwitchProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6">
      <span>
        <span className="block text-sm font-medium text-graphite-700">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-graphite-400">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-forest-600' : 'bg-graphite-200'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

interface IntegerInputProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  maxDigits?: number;
  suffix?: ReactNode;
}

export function IntegerInput({
  label,
  hint,
  value,
  onChange,
  maxDigits = 3,
  suffix,
}: IntegerInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, maxDigits).replace(/^0+(?=\d)/, '');
    onChange(digits ? Number(digits) : 0);
  };

  return (
    <div className="block">
      <label>
        <span className="block text-sm font-medium text-graphite-700">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-graphite-400">{hint}</span>}
      </label>
      <div
        className={`mt-2 flex items-center gap-4 border-b pb-1.5 transition-colors ${
          focused ? 'border-forest-600' : 'border-graphite-200'
        }`}
      >
        <input
          type="text"
          inputMode="numeric"
          aria-label={label}
          value={value > 0 ? String(value) : ''}
          placeholder="0"
          onFocus={(e) => {
            setFocused(true);
            selectAll(e.currentTarget);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-xl text-graphite-900 outline-none placeholder:text-graphite-300 tabular-nums"
        />
        {suffix}
      </div>
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex shrink-0 rounded-full bg-graphite-100 p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? 'bg-white text-graphite-900 shadow-sm'
                : 'text-graphite-500 hover:text-graphite-800'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
