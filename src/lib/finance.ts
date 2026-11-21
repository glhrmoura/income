export interface FinancialInputs {
  patrimonio: number;
  rentabilidadeMensalPct: number;
  aliquotaIrPct: number;
  inflacaoAcumuladaPct: number;
}

export interface FinancialResults {
  rendimentoBruto: number;
  impostoRenda: number;
  rendimentoLiquido: number;
  inflacaoMensalPct: number;
  reservaInflacao: number;
  valorDisponivel: number;
  percentualConsumivelPct: number;
  valorAPreservar: number;
  rendaInsuficiente: boolean;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSustainableIncome(
  inputs: FinancialInputs,
): FinancialResults {
  const { patrimonio, rentabilidadeMensalPct, aliquotaIrPct, inflacaoAcumuladaPct } = inputs;

  const rendimentoBruto = round2(patrimonio * (rentabilidadeMensalPct / 100));
  const impostoRenda = round2(rendimentoBruto * (aliquotaIrPct / 100));
  const rendimentoLiquido = round2(rendimentoBruto - impostoRenda);

  const inflacaoMensal = Math.pow(1 + inflacaoAcumuladaPct / 100, 1 / 12) - 1;
  const reservaInflacao = round2(patrimonio * Math.max(0, inflacaoMensal));

  const valorDisponivelBruto = round2(rendimentoLiquido - reservaInflacao);
  const rendaInsuficiente = valorDisponivelBruto < 0;
  const valorDisponivel = rendaInsuficiente ? 0 : valorDisponivelBruto;

  const percentualConsumivel =
    rendimentoLiquido > 0
      ? Math.min(100, (valorDisponivel / rendimentoLiquido) * 100)
      : 0;

  return {
    rendimentoBruto,
    impostoRenda,
    rendimentoLiquido,
    inflacaoMensalPct: round2(inflacaoMensal * 100),
    reservaInflacao,
    valorDisponivel,
    percentualConsumivelPct: round2(percentualConsumivel),
    valorAPreservar: reservaInflacao,
    rendaInsuficiente,
  };
}
