interface DistributionBarProps {
  tax: number;
  inflation: number;
  growth?: number;
  spendable: number;
}

export function DistributionBar({ tax, inflation, growth = 0, spendable }: DistributionBarProps) {
  const total = tax + inflation + growth + spendable;
  if (total <= 0) return null;

  const taxPct = (tax / total) * 100;
  const inflationPct = (inflation / total) * 100;
  const growthPct = (growth / total) * 100;
  const spendPct = (spendable / total) * 100;

  const segments = [
    { key: 'spend', pct: spendPct, className: 'bg-forest-600', label: 'Consumível' },
    { key: 'inflation', pct: inflationPct, className: 'bg-graphite-300', label: 'Reserva p/ inflação' },
    ...(growth > 0
      ? [{ key: 'growth', pct: growthPct, className: 'bg-forest-200', label: 'Reserva p/ crescimento real' }]
      : []),
    { key: 'tax', pct: taxPct, className: 'bg-graphite-800', label: 'Impostos' },
  ];

  return (
    <div>
      <div className="flex h-10 w-full overflow-hidden rounded-sm border border-graphite-200 bg-graphite-100">
        {segments.map(
          (seg) =>
            seg.pct > 0 && (
              <div
                key={seg.key}
                className={`${seg.className} h-full transition-all duration-500`}
                style={{ width: `${seg.pct}%` }}
                title={`${seg.label}: ${seg.pct.toFixed(1)}%`}
              />
            ),
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-[2px] ${seg.className}`} />
            <span className="text-xs text-graphite-500">
              {seg.label} · {seg.pct.toFixed(1).replace('.', ',')}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
