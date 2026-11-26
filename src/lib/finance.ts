export interface FinancialInputs {
  patrimonio: number;
  rentabilidadeMensalPct: number;
  aliquotaIrPct: number;
  inflacaoAcumuladaPct: number;
  crescimentoRealAnualPct?: number;
}

export interface FinancialResults {
  rendimentoBruto: number;
  impostoRenda: number;
  rendimentoLiquido: number;
  inflacaoMensalPct: number;
  reservaInflacao: number;
  crescimentoRealMensalPct: number;
  reservaCrescimento: number;
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
  const {
    patrimonio,
    rentabilidadeMensalPct,
    aliquotaIrPct,
    inflacaoAcumuladaPct,
    crescimentoRealAnualPct = 0,
  } = inputs;

  const rendimentoBruto = round2(patrimonio * (rentabilidadeMensalPct / 100));
  const impostoRenda = round2(rendimentoBruto * (aliquotaIrPct / 100));
  const rendimentoLiquido = round2(rendimentoBruto - impostoRenda);

  const inflacaoMensal = Math.pow(1 + inflacaoAcumuladaPct / 100, 1 / 12) - 1;
  const reservaInflacao = round2(patrimonio * Math.max(0, inflacaoMensal));

  const crescimentoRealMensal = Math.pow(1 + Math.max(0, crescimentoRealAnualPct) / 100, 1 / 12) - 1;
  const retencaoMensal =
    (1 + Math.max(0, inflacaoMensal)) * (1 + crescimentoRealMensal) - 1;
  const reservaCrescimento = round2(
    Math.max(0, patrimonio * retencaoMensal - reservaInflacao),
  );
  const valorAPreservar = round2(reservaInflacao + reservaCrescimento);

  const valorDisponivelBruto = round2(rendimentoLiquido - valorAPreservar);
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
    crescimentoRealMensalPct: round2(crescimentoRealMensal * 100),
    reservaCrescimento,
    valorDisponivel,
    percentualConsumivelPct: round2(percentualConsumivel),
    valorAPreservar,
    rendaInsuficiente,
  };
}

export interface ProjectionResults {
  meses: number;
  patrimonioFinal: number;
  patrimonioFinalReal: number;
  rendaMensalFinal: number;
  rendaMensalFinalReal: number;
  totalConsumido: number;
  totalAportado: number;
  totalRendimentoLiquido: number;
  variacaoNominalPct: number;
}

export function projectWealth(
  inputs: FinancialInputs,
  meses: number,
  aporteMensal = 0,
  gastarRendimento = true,
): ProjectionResults {
  const periodo = Math.max(0, Math.floor(meses));
  const aporte = Math.max(0, aporteMensal);
  let patrimonio = inputs.patrimonio;
  let totalConsumido = 0;
  let totalRendimentoLiquido = 0;

  for (let mes = 0; mes < periodo; mes += 1) {
    const resultado = calculateSustainableIncome({ ...inputs, patrimonio });
    const retirada = gastarRendimento ? resultado.valorDisponivel : 0;
    totalConsumido += retirada;
    totalRendimentoLiquido += resultado.rendimentoLiquido;
    patrimonio += resultado.rendimentoLiquido - retirada + aporte;
  }

  const inflacaoMensal = Math.max(
    0,
    Math.pow(1 + inputs.inflacaoAcumuladaPct / 100, 1 / 12) - 1,
  );
  const deflator = Math.pow(1 + inflacaoMensal, periodo);
  const rendaMensalFinal = calculateSustainableIncome({ ...inputs, patrimonio }).valorDisponivel;

  return {
    meses: periodo,
    patrimonioFinal: round2(patrimonio),
    patrimonioFinalReal: round2(patrimonio / deflator),
    rendaMensalFinal,
    rendaMensalFinalReal: round2(rendaMensalFinal / deflator),
    totalConsumido: round2(totalConsumido),
    totalAportado: round2(aporte * periodo),
    totalRendimentoLiquido: round2(totalRendimentoLiquido),
    variacaoNominalPct:
      inputs.patrimonio > 0 ? round2((patrimonio / inputs.patrimonio - 1) * 100) : 0,
  };
}
