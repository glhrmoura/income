import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MoneyInput, PercentInput } from '@/components/Inputs';
import { DistributionBar } from '@/components/DistributionBar';
import { Skeleton } from '@/components/Skeleton';
import { calculateSustainableIncome } from '@/lib/finance';
import { usePersistentNumber } from '@/lib/usePersistentNumber';
import { getInflationData, readCachedInflation, type InflationData } from '@/lib/ipca';
import {
  formatBRL,
  formatPercent,
} from '@/lib/format';

type InflationStatus =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; data: InflationData };

function App() {
  const [patrimonio, setPatrimonio] = usePersistentNumber('patrimonio', 1_000_000);
  const [rentabilidade, setRentabilidade] = usePersistentNumber('rentabilidade', 1);
  const [aliquotaIr, setAliquotaIr] = usePersistentNumber('aliquotaIr', 15);
  const [inflation, setInflation] = useState<InflationStatus>(() => {
    const cached = readCachedInflation();
    return cached ? { state: 'ready', data: cached } : { state: 'loading' };
  });

  useEffect(() => {
    let active = true;
    getInflationData()
      .then((data) => {
        if (active) setInflation({ state: 'ready', data });
      })
      .catch((error: Error) => {
        if (active) setInflation({ state: 'error', message: error.message });
      });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    if (inflation.state !== 'ready') return null;
    return calculateSustainableIncome({
      patrimonio,
      rentabilidadeMensalPct: rentabilidade,
      aliquotaIrPct: aliquotaIr,
      inflacaoAcumuladaPct: inflation.data.acumulado12m,
    });
  }, [patrimonio, rentabilidade, aliquotaIr, inflation]);

  const loading = inflation.state === 'loading';

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-graphite-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <span className="font-display text-xl font-medium leading-tight tracking-tight text-graphite-900">
              Renda Sustentável
            </span>
            <span className="text-xs text-graphite-400">
              Calculadora patrimonial
            </span>
          </div>

          <div
            className={`${inflation.state === 'error' ? 'flex' : 'hidden sm:flex'} items-center gap-6 text-xs text-graphite-500`}
          >
            {loading && (
              <>
                <span className="sr-only">Consultando IPCA no IBGE…</span>
                <div className="flex items-center">
                  <span className="text-graphite-400">IPCA 12 meses</span>
                  <Skeleton className="ml-2 h-3.5 w-10" />
                </div>
                <div className="flex items-center">
                  <span className="text-graphite-400">Referência</span>
                  <Skeleton className="ml-2 h-3.5 w-20" />
                </div>
                <div className="hidden md:block">
                  <span className="text-graphite-400">Fonte</span>
                  <span className="ml-2 text-graphite-700">IBGE · série 1737</span>
                </div>
              </>
            )}
            {inflation.state === 'error' && (
              <span className="flex items-center gap-2 text-alert-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Não foi possível consultar a inflação agora. Tente novamente mais tarde.
              </span>
            )}
            {inflation.state === 'ready' && (
              <>
                <div>
                  <span className="text-graphite-400">IPCA 12 meses</span>
                  <span className="ml-2 font-medium text-graphite-900">
                    {formatPercent(inflation.data.acumulado12m)}
                  </span>
                </div>
                <div>
                  <span className="text-graphite-400">Referência</span>
                  <span className="ml-2 capitalize text-graphite-700">
                    {inflation.data.periodoReferencia}
                  </span>
                </div>
                <div className="hidden md:block">
                  <span className="text-graphite-400">Fonte</span>
                  <span className="ml-2 text-graphite-700">IBGE · série 1737</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="pt-12 md:pt-16">
          <h1 className="max-w-2xl font-display text-3xl leading-[120%] text-graphite-900 text-pretty md:text-[2.6rem]">
            Quanto você pode gastar por mês{' '}
            <span className="text-graphite-400 md:block">sem gastar o seu patrimônio.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[150%] text-graphite-500">
            Uma estimativa simples de quanto da renda dos seus investimentos pode ser
            usada todo mês, mantendo o poder de compra do patrimônio.
          </p>
        </section>

        <section className="grid gap-12 py-12 md:grid-cols-[5fr_7fr] md:gap-16">
          <div className="flex flex-col gap-8">
            <h2 className="font-display text-2xl font-medium tracking-tight text-graphite-900 md:text-[1.75rem]">
              Seus investimentos
            </h2>
            <MoneyInput
              label="Patrimônio investido"
              hint="Valor total aplicado, em reais"
              value={patrimonio}
              onChange={setPatrimonio}
              invalid={patrimonio <= 0}
            />
            <PercentInput
              label="Rentabilidade mensal"
              hint="Rendimento médio do investimento, ao mês"
              value={rentabilidade}
              onChange={setRentabilidade}
              invalid={rentabilidade < 0}
            />
            <PercentInput
              label="Imposto de Renda"
              hint="Alíquota efetiva sobre o rendimento (ex.: 15%)"
              value={aliquotaIr}
              onChange={setAliquotaIr}
              invalid={aliquotaIr < 0 || aliquotaIr > 100}
            />
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col justify-center border-t border-graphite-200 bg-paper/95 px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur md:static md:z-auto md:border-l md:border-t-0 md:bg-transparent md:p-0 md:pl-16 md:backdrop-blur-none">
            {results && !results.rendaInsuficiente ? (
              <>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-graphite-400 md:text-sm">
                  Você pode gastar
                </p>
                <p className="mt-2 font-display text-4xl font-medium leading-none tracking-tight md:mt-4 text-forest-600 md:text-7xl">
                  {formatBRL(results.valorDisponivel)}
                </p>
                <p className="mt-1 text-xs text-graphite-500 md:mt-3 md:text-sm">por mês</p>
                <p className="mt-6 hidden max-w-md text-[13px] leading-[150%] text-graphite-400 md:block">
                  Valor estimado disponível mensalmente após impostos e reserva para
                  compensar a inflação.
                </p>
              </>
            ) : results && results.rendaInsuficiente ? (
              <>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-graphite-400 md:text-sm">
                  Você pode gastar
                </p>
                <p className="mt-2 font-display text-4xl font-medium leading-none tracking-tight md:mt-4 text-graphite-300 md:text-7xl">
                  R$ 0,00
                </p>
                <p className="mt-1 text-xs text-graphite-500 md:mt-3 md:text-sm">por mês</p>
                <div className="mt-3 flex max-w-md items-start gap-3 border-l-2 md:mt-6 border-alert-500 bg-alert-50 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alert-600" />
                  <p className="text-[13px] leading-[150%] text-alert-600">
                    A rentabilidade líquida não está sendo suficiente para preservar o
                    poder de compra do patrimônio. Todo o rendimento líquido será
                    reinvestido para compensar a inflação.
                  </p>
                </div>
              </>
            ) : loading ? (
              <>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-graphite-400 md:text-sm">
                  Você pode gastar
                </p>
                <Skeleton className="mt-2 block h-9 w-56 md:mt-4 md:h-[4.5rem] md:w-[26rem]" />
                <p className="mt-1 text-xs text-graphite-500 md:mt-3 md:text-sm">por mês</p>
                <p className="mt-6 hidden max-w-md text-[13px] leading-[150%] text-graphite-400 md:block">
                  Valor estimado disponível mensalmente após impostos e reserva para
                  compensar a inflação.
                </p>
              </>
            ) : (
              <p className="text-sm text-graphite-400">
                Informe seus dados ao lado para ver o resultado.
              </p>
            )}
          </div>
        </section>

        {(results || loading) && (
          <section className="pb-12 md:pt-12">
            <h2 className="font-display text-2xl font-medium tracking-tight text-graphite-900 md:text-[1.75rem]">
              Detalhamento do cálculo
            </h2>
            <div className="mt-8 overflow-hidden">
              <dl className="grid gap-x-16 gap-y-0 sm:grid-cols-2">
                {[
                  {
                    term: 'Patrimônio atual',
                    desc: 'Valor total que você possui investido.',
                    value: formatBRL(patrimonio),
                  },
                  {
                    term: 'Rendimento bruto mensal',
                    desc: 'Patrimônio × rentabilidade mensal.',
                    value: results && formatBRL(results.rendimentoBruto),
                  },
                  {
                    term: 'Imposto de Renda estimado',
                    desc: `Aplicação da alíquota informada (${formatPercent(aliquotaIr)}) sobre o rendimento bruto.`,
                    value: results && `−\u00A0${formatBRL(results.impostoRenda)}`,
                  },
                  {
                    term: 'Rendimento líquido mensal',
                    desc: 'O que sobra do rendimento após o IR.',
                    value: results && formatBRL(results.rendimentoLiquido),
                  },
                  {
                    term: 'Reserva mensal para inflação',
                    desc:
                      results && inflation.state === 'ready'
                        ? `Valor necessário para o patrimônio acompanhar o IPCA (${formatPercent(inflation.data.acumulado12m)} nos últimos 12 meses, equivalente a ${formatPercent(results.inflacaoMensalPct)} ao mês).`
                        : 'Valor necessário para o patrimônio acompanhar o IPCA (… nos últimos 12 meses, equivalente a … ao mês).',
                    value: results && `−\u00A0${formatBRL(results.reservaInflacao)}`,
                  },
                  {
                    term: 'Disponível para consumo',
                    desc: 'Percentual do rendimento líquido que pode ser gasto.',
                    value: results && formatPercent(results.percentualConsumivelPct),
                  },
                ].map((item) => (
                  <div
                    key={item.term}
                    className="flex items-start justify-between gap-6 border-b border-graphite-100 py-5"
                  >
                    <dt className="max-w-[16rem]">
                      <span className="block text-sm font-medium text-graphite-800">
                        {item.term}
                      </span>
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
            </div>
            <p className="mt-6 text-xs leading-[150%] text-graphite-400">
              Valor que deve permanecer investido para preservar o poder de compra do
              patrimônio:{' '}
              {results ? formatBRL(results.valorAPreservar) : <Skeleton className="h-3 w-20" />} por mês
              (reserva para inflação).
            </p>
          </section>
        )}

        {(results || loading) && (
          <section className="pb-12">
            <h2 className="font-display text-2xl font-medium tracking-tight text-graphite-900 md:text-[1.75rem]">
              Distribuição do rendimento
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-[150%] text-graphite-500">
              Como o rendimento bruto mensal se divide entre o que você pode gastar, o
              que fica investido para compensar a inflação e o que vai para impostos.
            </p>
            <div className="mt-8">
              {results ? (
                <DistributionBar
                  tax={results.impostoRenda}
                  inflation={results.reservaInflacao}
                  spendable={results.valorDisponivel}
                />
              ) : (
                <div>
                  <Skeleton className="block h-10 w-full" />
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {inflation.state === 'ready' && inflation.data.desatualizado && (
          <section className="border-t border-graphite-200 py-12">
            <div className="flex items-start gap-3 border-l-2 border-alert-500 bg-alert-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alert-600" />
              <p className="text-[13px] leading-[150%] text-alert-600">
                Não foi possível contatar o IBGE agora. O cálculo está usando o último
                dado válido salvo (referência: {inflation.data.periodoReferencia}), que
                pode não estar atualizado.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-graphite-200 pb-40 pt-8 md:pb-8">
        <p className="mx-auto max-w-6xl px-6 text-xs text-graphite-400">
          Renda Sustentável — ferramenta de estimativa. Não constitui recomendação de
          investimento.
        </p>
      </footer>
    </div>
  );
}

export default App;
