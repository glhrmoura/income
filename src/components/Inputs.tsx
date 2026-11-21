import { useState } from 'react';

interface MoneyInputProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
}

interface PercentInputProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
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

export function PercentInput({ label, hint, value, onChange, invalid }: PercentInputProps) {
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
      </div>
    </label>
  );
}
