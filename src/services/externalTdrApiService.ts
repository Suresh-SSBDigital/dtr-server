import axios, { type AxiosInstance } from 'axios';

type JsonMap = Record<string, unknown>;

export interface ExternalSourceBundle {
  agencyApplication: JsonMap;
  ownerDetail: JsonMap;
  applicationStatus: JsonMap;
  form6Ledger: JsonMap;
  drcList: JsonMap;
}

export interface NormalizedExternalTdrData {
  owner: JsonMap;
  project: JsonMap;
  land: JsonMap;
  drc: JsonMap;
  transfers: unknown[];
  utilization: unknown[];
  ledger: unknown[];
  documents: JsonMap;
}

function getAxiosClient(): AxiosInstance {
  const baseURL = process.env.EXTERNAL_TDR_BASE_URL;
  if (!baseURL) {
    const err = new Error('EXTERNAL_TDR_BASE_URL is missing') as Error & { statusCode?: number };
    err.statusCode = 500;
    throw err;
  }

  const timeoutMs = Number(process.env.EXTERNAL_TDR_TIMEOUT_MS ?? 12000);
  return axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.EXTERNAL_TDR_API_KEY ? { 'x-api-key': process.env.EXTERNAL_TDR_API_KEY } : {}),
      ...(process.env.EXTERNAL_TDR_BEARER_TOKEN
        ? { Authorization: `Bearer ${process.env.EXTERNAL_TDR_BEARER_TOKEN}` }
        : {})
    }
  });
}

async function postWithRetry(client: AxiosInstance, path: string, body: JsonMap): Promise<JsonMap> {
  const maxRetries = Math.max(0, Number(process.env.EXTERNAL_TDR_RETRY_COUNT ?? 2));
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      const response = await client.post(path, body);
      return (response.data ?? {}) as JsonMap;
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > maxRetries) break;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }

  const err = new Error(`External API failed: POST ${path}`) as Error & {
    statusCode?: number;
    cause?: unknown;
  };
  err.statusCode = 502;
  err.cause = lastError;
  throw err;
}

export async function fetchOfficialExternalData(application_id: string, samagra_id: string): Promise<ExternalSourceBundle> {
  const client = getAxiosClient();
  const payload = { application_id, samagra_id };

  const [agencyApplication, ownerDetail, applicationStatus, form6Ledger, drcList] = await Promise.all([
    postWithRetry(client, '/api/Agency/GetAgencyApplication', payload),
    postWithRetry(client, '/api/User/GetDRCOwnerDetail', payload),
    postWithRetry(client, '/api/Department/GetApplicationStatus', payload),
    postWithRetry(client, '/api/Agency/GetForm6Leger', payload),
    postWithRetry(client, '/api/User/GetDRCList', payload)
  ]);

  return {
    agencyApplication,
    ownerDetail,
    applicationStatus,
    form6Ledger,
    drcList
  };
}

function asObject(v: unknown): JsonMap {
  return v && typeof v === 'object' ? (v as JsonMap) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function normalizeExternalSourceData(raw: ExternalSourceBundle): NormalizedExternalTdrData {
  const app = asObject(raw.agencyApplication);
  const ownerDetail = asObject(raw.ownerDetail);
  const status = asObject(raw.applicationStatus);
  const form6 = asObject(raw.form6Ledger);
  const drcList = asObject(raw.drcList);

  return {
    owner: asObject(ownerDetail.owner ?? ownerDetail.data ?? app.owner),
    project: {
      ...asObject(app.project ?? app.application ?? app.data),
      status: status.status ?? status.application_status ?? app.status
    },
    land: asObject(app.land ?? app.parcel ?? app.land_detail),
    drc: asObject(drcList.current ?? drcList.latest ?? drcList.data),
    transfers: asArray(form6.transfers ?? app.transfers ?? app.transfer_list),
    utilization: asArray(form6.utilization ?? app.utilizations ?? app.utilization_list),
    ledger: asArray(form6.ledger ?? form6.entries ?? app.ledger),
    documents: asObject(app.documents ?? app.document_hashes ?? {})
  };
}
