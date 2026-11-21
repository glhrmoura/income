export interface InflationData {
  acumulado12m: number;
  periodoReferencia: string;
  desatualizado: boolean;
}

const SIDRA_URL =
  'https://apisidra.ibge.gov.br/values/t/1737/n1/1/v/2265/p/last%2012/f/n';

const CACHE_KEY = 'income:ipca';
const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

interface CachedEntry {
  data: InflationData;
  fetchedAt: number;
}

let inFlight: Promise<InflationData> | null = null;

interface SidraRow {
  V: string;
  D3N: string;
}

async function fetchFromIbge(): Promise<InflationData> {
  const response = await fetch(SIDRA_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`API do IBGE retornou status ${response.status}`);
  }

  const json: unknown = await response.json();
  if (!Array.isArray(json) || json.length < 2) {
    throw new Error('Resposta inesperada da API do IBGE');
  }

  const rows = (json.slice(1) as SidraRow[]).filter(
    (row) => row.V !== '' && row.V !== '...' && row.V !== null,
  );

  if (rows.length === 0) {
    throw new Error('Sem dados disponíveis na série do IBGE');
  }

  const latest = rows[rows.length - 1];
  const value = Number(latest.V);
  if (!Number.isFinite(value)) {
    throw new Error('Valor de IPCA inválido na resposta do IBGE');
  }

  return {
    acumulado12m: Number(value.toFixed(2)),
    periodoReferencia: latest.D3N.toLowerCase(),
    desatualizado: false,
  };
}

function readCacheEntry(): CachedEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<CachedEntry>;
    const data = entry.data;
    if (
      !data ||
      typeof entry.fetchedAt !== 'number' ||
      typeof data.acumulado12m !== 'number' ||
      typeof data.periodoReferencia !== 'string'
    ) {
      return null;
    }
    return {
      fetchedAt: entry.fetchedAt,
      data: {
        acumulado12m: data.acumulado12m,
        periodoReferencia: data.periodoReferencia,
        desatualizado: false,
      },
    };
  } catch {
    return null;
  }
}

function saveToCache(data: InflationData): void {
  try {
    const entry: CachedEntry = { data, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    return;
  }
}

export function readCachedInflation(): InflationData | null {
  return readCacheEntry()?.data ?? null;
}

async function refresh(): Promise<InflationData> {
  try {
    const data = await fetchFromIbge();
    saveToCache(data);
    return data;
  } catch (error) {
    console.error('Falha ao consultar IPCA no IBGE:', error);
    const cached = readCacheEntry();
    if (cached) return { ...cached.data, desatualizado: true };
    throw new Error(
      'Não foi possível obter a inflação do IBGE e não há dados salvos.',
    );
  }
}

export function getInflationData(): Promise<InflationData> {
  const cached = readCacheEntry();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }
  inFlight ??= refresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
