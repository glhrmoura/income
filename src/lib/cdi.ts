export interface CdiData {
  anualPct: number;
  dataReferencia: string;
  desatualizado: boolean;
}

const SGS_URL =
  'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json';

const CACHE_KEY = 'income:cdi';
const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DIAS_UTEIS_ANO = 252;
const DIAS_UTEIS_MES = 21;

interface CachedEntry {
  data: CdiData;
  fetchedAt: number;
}

interface SgsRow {
  data: string;
  valor: string;
}

let inFlight: Promise<CdiData> | null = null;

async function fetchFromBcb(): Promise<CdiData> {
  const response = await fetch(SGS_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`API do Banco Central retornou status ${response.status}`);
  }

  const json: unknown = await response.json();
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error('Resposta inesperada da API do Banco Central');
  }

  const latest = json[json.length - 1] as SgsRow;
  const value = Number(latest.valor);
  if (!Number.isFinite(value) || typeof latest.data !== 'string') {
    throw new Error('Valor de CDI inválido na resposta do Banco Central');
  }

  return {
    anualPct: Number(value.toFixed(2)),
    dataReferencia: latest.data,
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
      typeof data.anualPct !== 'number' ||
      typeof data.dataReferencia !== 'string'
    ) {
      return null;
    }
    return {
      fetchedAt: entry.fetchedAt,
      data: {
        anualPct: data.anualPct,
        dataReferencia: data.dataReferencia,
        desatualizado: false,
      },
    };
  } catch {
    return null;
  }
}

function saveToCache(data: CdiData): void {
  try {
    const entry: CachedEntry = { data, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    return;
  }
}

export function readCachedCdi(): CdiData | null {
  return readCacheEntry()?.data ?? null;
}

async function refresh(): Promise<CdiData> {
  try {
    const data = await fetchFromBcb();
    saveToCache(data);
    return data;
  } catch (error) {
    console.error('Falha ao consultar CDI no Banco Central:', error);
    const cached = readCacheEntry();
    if (cached) return { ...cached.data, desatualizado: true };
    throw new Error('Não foi possível obter o CDI do Banco Central e não há dados salvos.');
  }
}

export function getCdiData(): Promise<CdiData> {
  const cached = readCacheEntry();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }
  inFlight ??= refresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export function cdiMensalPct(cdiAnualPct: number, percentualCdi = 100): number {
  const diario = Math.pow(1 + cdiAnualPct / 100, 1 / DIAS_UTEIS_ANO) - 1;
  const mensal = Math.pow(1 + diario * (percentualCdi / 100), DIAS_UTEIS_MES) - 1;
  return mensal * 100;
}
