import { IntegerInput, MoneyInput, Segmented, Switch } from '@/components/Inputs';
import { Skeleton } from '@/components/Skeleton';
import type { ProjectionResults } from '@/lib/finance';
import { formatBRL, formatPercent } from '@/lib/format';

export type PeriodUnit = 'meses' | 'anos';

interface ProjectionProps {
  prazo: number;
  unidade: PeriodUnit;
  onPrazoChange: (value: number) => void;
  onUnidadeChange: (value: PeriodUnit) => void;
  aporte: number;
  onAporteChange: (value: number) => void;
  gastarRendimento: boolean;
  onGastarRendimentoChange: (value: boolean) => void;
  results: ProjectionResults | null;
}

const UNIT_OPTIONS: { value: PeriodUnit; label: string }[] = [
  { value: 'meses', label: 'Meses' },
  { value: 'anos', label: 'Anos' },
];

function describePeriod(prazo: number, unidade: PeriodUnit): string {
  if (unidade === 'anos') return `${prazo} ${prazo === 1 ? 'ano' : 'anos'}`;
  return `${prazo} ${prazo === 1 ? 'mês' : 'meses'}`;
}

export function Projection({
  prazo,
  unidade,
  onPrazoChange,
  onUnidadeChange,
  aporte,
  onAporteChange,
  gastarRendimento,
  onGastarRendimentoChange,
  results,
}: ProjectionProps) {
  const periodo = describePeriod(prazo, unidade);
  const sinal = results && results.variacaoNominalPct > 0 ? '+' : '';

  const items = [
    {
      term: 'Patrimônio estimado',
      desc: `Valor nominal do patrimônio daqui a ${periodo}${
        results ? ` (${sinal}${formatPercent(results.variacaoNominalPct)} em relação a hoje)` : ''
      }.`,
      value: results && formatBRL(results.patrimonioFinal),
    },
    {
      term: 'Em valores de hoje',
      desc: 'Patrimônio estimado descontada a inflação do período, pelo IPCA atual.',
      value: results && formatBRL(results.patrimonioFinalReal),
    },
    {
      term: 'Gasto mensal possível no fim',
      desc: results
        ? `Quanto você poderá gastar por mês ao final do prazo (${formatBRL(results.rendaMensalFinalReal)} em valores de hoje).`
        : 'Quanto você poderá gastar por mês ao final do prazo.',
      value: results && formatBRL(results.rendaMensalFinal),
    },
    {
      term: 'Total gasto no período',
      desc: 'Soma de tudo o que foi retirado para consumo ao longo do prazo.',
      value: results && formatBRL(results.totalConsumido),
    },
    {
      term: 'Total aportado',
      desc: 'Soma dos aportes mensais feitos ao longo do prazo.',
      value: results && formatBRL(results.totalAportado),
    },
    {
      term: 'Rendimento reinvestido',
      desc: 'Soma do rendimento líquido que ficou investido ao longo do prazo.',
      value: results && formatBRL(results.totalRendimentoLiquido - results.totalConsumido),
    },
  ];

  return (
    <section className="pb-12">
      <h2 className="font-display text-2xl font-medium tracking-tight text-graphite-900 md:text-[1.75rem]">
        Simulação no tempo
      </h2>
      <p className="mt-2 max-w-xl text-[13px] leading-[150%] text-graphite-500">
        {gastarRendimento
          ? 'Como o patrimônio evolui se você gastar todo mês o valor sugerido, reinvestir o restante e fizer aportes, mantendo a rentabilidade, o imposto e a inflação atuais.'
          : 'Como o patrimônio evolui se você não gastar nada e reinvestir todo o rendimento e os aportes, mantendo a rentabilidade, o imposto e a inflação atuais.'}
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-x-16">
        <IntegerInput
          label="Prazo"
          hint="Daqui a quanto tempo você quer ver o resultado"
          value={prazo}
          onChange={onPrazoChange}
          suffix={
            <Segmented
              label="Unidade do prazo"
              options={UNIT_OPTIONS}
              value={unidade}
              onChange={onUnidadeChange}
            />
          }
        />
        <MoneyInput
          label="Aporte mensal"
          hint="Valor que você investe a mais todo mês"
          value={aporte}
          onChange={onAporteChange}
          invalid={aporte < 0}
        />
        <Switch
          label="Gastar o rendimento"
          hint="Desligado, todo o rendimento será reinvestido"
          checked={gastarRendimento}
          onChange={onGastarRendimentoChange}
        />
      </div>

      <dl className="mt-4 grid gap-x-16 gap-y-0 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.term}
            className="flex items-start justify-between gap-6 border-b border-graphite-100 py-5"
          >
            <dt className="max-w-[16rem]">
              <span className="block text-sm font-medium text-graphite-800">{item.term}</span>
              <span className="mt-1 block text-xs leading-[150%] text-graphite-400">
                {item.desc}
              </span>
            </dt>
            <dd className="whitespace-nowrap text-right text-base tabular-nums text-graphite-900">
              {item.value ?? <Skeleton className="h-5 w-28" />}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
