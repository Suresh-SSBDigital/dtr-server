/* eslint-disable @typescript-eslint/no-explicit-any */
// Fabric dependency is optional in backend runtime and available in chaincode runtime.
let ContractBase: any = class {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ContractBase = require('fabric-contract-api').Contract;
} catch {}

export interface ChainAsset {
  application_id: string;
  tdrApplicationId?: string;
  rid: string;
  hash: string;
  txId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  lastAction: string;
  ledgerSnapshot: number;
  utilized_tdr_value: number;
  remaining_tdr_value: number;
  owner?: string;
  district?: string;
}

export interface ChainAssetInput {
  application_id: string;
  tdrApplicationId?: string;
  rid: string;
  hash: string;
  txId?: string;
  timestamp?: string;
  status?: string;
  lastAction?: string;
  ledgerSnapshot?: number;
  utilized_tdr_value?: number;
  remaining_tdr_value?: number;
  owner?: string;
  district?: string;
}

export interface ChainAssetHistoryEntry {
  txId: string;
  timestamp: string;
  value: ChainAsset | null;
  isDelete: boolean;
}

const chainStore = new Map<string, ChainAsset>();
const ridIndex = new Map<string, string>();
const historyStore = new Map<string, ChainAssetHistoryEntry[]>();

const nowIso = (): string => new Date().toISOString();
const nextTxId = (): string => `sim-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const statusCodeError = (message: string, statusCode: number): Error & { statusCode?: number } => {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = statusCode;
  return err;
};

const appendHistory = (application_id: string, entry: ChainAssetHistoryEntry): void => {
  const current = historyStore.get(application_id) ?? [];
  current.push(entry);
  historyStore.set(application_id, current);
};

const parseAssetJson = (assetJson: string): ChainAssetInput => {
  if (!assetJson) throw new Error('assetJson is required');
  return JSON.parse(assetJson);
};

const txTimestampFromCtx = (ctx: any): string => {
  const ts = ctx?.stub?.getTxTimestamp?.();
  if (!ts) return nowIso();
  const seconds = Number(ts.seconds?.low ?? ts.seconds ?? 0);
  const nanos = Number(ts.nanos ?? 0);
  return new Date(seconds * 1000 + Math.floor(nanos / 1e6)).toISOString();
};

const formatAsiaKolkataIso = (date: Date): string => {
  // Returns ISO-like string but in Asia/Kolkata wall-clock time.
  // This avoids confusion when clients expect IST.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const yyyy = get('year');
  const mm = get('month');
  const dd = get('day');
  const HH = get('hour');
  const MM = get('minute');
  const SS = get('second');

  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}.000+05:30`;
};

const txIdFromCtx = (ctx: any): string => {
  return ctx?.stub?.getTxID?.() ?? nextTxId();
};

export const assetExists = async (application_id: string): Promise<boolean> => chainStore.has(application_id);

export const createAsset = async (asset: ChainAssetInput): Promise<ChainAsset> => {
  if (!asset.application_id) throw statusCodeError('application_id is required', 400);
  if (!asset.rid) throw statusCodeError('rid is required', 400);
  if (!asset.hash) throw statusCodeError('hash is required', 400);
  if (await assetExists(asset.application_id)) throw statusCodeError('Blockchain asset already exists for application_id', 409);
  // Same RID may appear on multiple chain assets (e.g. transfer recipient reuses source RID); index first match only.
  if (!ridIndex.has(asset.rid)) ridIndex.set(asset.rid, asset.application_id);

  const timestamp = asset.timestamp ?? nowIso();
  const created: ChainAsset = {
    application_id: asset.application_id,
    tdrApplicationId: asset.tdrApplicationId,
    rid: asset.rid,
    hash: asset.hash,
    txId: asset.txId ?? nextTxId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    status: asset.status ?? 'CREATED',
    lastAction: asset.lastAction ?? 'CREATE_TDR',
    ledgerSnapshot: Number(asset.ledgerSnapshot ?? 0),
    utilized_tdr_value: Number(asset.utilized_tdr_value ?? 0),
    remaining_tdr_value: Number(asset.remaining_tdr_value ?? 0),
    owner: asset.owner,
    district: asset.district
  };

  chainStore.set(created.application_id, created);
  appendHistory(created.application_id, { txId: created.txId, timestamp: created.updatedAt, value: created, isDelete: false });
  return created;
};

export const updateAsset = async (asset: ChainAssetInput): Promise<ChainAsset> => {
  const existing = chainStore.get(asset.application_id);
  if (!existing) throw statusCodeError('Blockchain asset not found for application_id', 404);
  if (existing.rid !== asset.rid) throw statusCodeError('RID mismatch for blockchain asset update', 400);

  const updated: ChainAsset = {
    ...existing,
    hash: asset.hash ?? existing.hash,
    tdrApplicationId: asset.tdrApplicationId ?? existing.tdrApplicationId,
    txId: asset.txId ?? nextTxId(),
    updatedAt: asset.timestamp ?? nowIso(),
    status: asset.status ?? existing.status,
    lastAction: asset.lastAction ?? existing.lastAction,
    ledgerSnapshot: Number(asset.ledgerSnapshot ?? existing.ledgerSnapshot),
    utilized_tdr_value: Number(asset.utilized_tdr_value ?? existing.utilized_tdr_value),
    remaining_tdr_value: Number(asset.remaining_tdr_value ?? existing.remaining_tdr_value),
    owner: asset.owner ?? existing.owner,
    district: asset.district ?? existing.district
  };

  chainStore.set(updated.application_id, updated);
  appendHistory(updated.application_id, { txId: updated.txId, timestamp: updated.updatedAt, value: updated, isDelete: false });
  return updated;
};

export const readAsset = async (application_id: string): Promise<ChainAsset> => {
  const asset = chainStore.get(application_id);
  if (!asset) throw statusCodeError('Blockchain asset not found for application_id', 404);
  return asset;
};

export const getAsset = async (application_id: string): Promise<ChainAsset | null> => chainStore.get(application_id) ?? null;

export const getAssetByRid = async (rid: string): Promise<ChainAsset | null> => {
  const viaIndex = ridIndex.get(rid);
  if (viaIndex) {
    const a = chainStore.get(viaIndex);
    if (a?.rid === rid) return a;
  }
  for (const a of chainStore.values()) {
    if (a.rid === rid) return a;
  }
  return null;
};

export const getAssetHistory = async (application_id: string): Promise<ChainAssetHistoryEntry[]> => historyStore.get(application_id) ?? [];

/** Alias for Fabric chaincode / peers: `getHistory` */
export const getHistory = getAssetHistory;
export const getAllAssets = async (): Promise<ChainAsset[]> => Array.from(chainStore.values());

export const deleteAsset = async (application_id: string): Promise<void> => {
  const asset = chainStore.get(application_id);
  if (!asset) throw statusCodeError('Blockchain asset not found for application_id', 404);
  chainStore.delete(application_id);
  if (ridIndex.get(asset.rid) === application_id) {
    ridIndex.delete(asset.rid);
    for (const a of chainStore.values()) {
      if (a.rid === asset.rid) {
        ridIndex.set(a.rid, a.application_id);
        break;
      }
    }
  }
  appendHistory(application_id, { txId: nextTxId(), timestamp: nowIso(), value: null, isDelete: true });
};

export const getAssetsByStatus = async (status: string): Promise<ChainAsset[]> =>
  Array.from(chainStore.values()).filter((a) => a.status === status);
export const getAssetsByRid = async (rid: string): Promise<ChainAsset[]> =>
  Array.from(chainStore.values()).filter((a) => a.rid === rid);
export const getAssetsByOwner = async (owner: string): Promise<ChainAsset[]> =>
  Array.from(chainStore.values()).filter((a) => a.owner === owner);
export const getAssetsByDistrict = async (district: string): Promise<ChainAsset[]> =>
  Array.from(chainStore.values()).filter((a) => a.district === district);

export class TdrAssetContract extends ContractBase {
  constructor() {
    super('TdrAssetContract');
  }

  async createAsset(ctx: any, assetJson: string): Promise<string> {
    const payload = parseAssetJson(assetJson);
    const created = await createAsset({
      ...payload,
      txId: txIdFromCtx(ctx),
      timestamp: txTimestampFromCtx(ctx),
      status: payload.status ?? 'CREATED',
      lastAction: payload.lastAction ?? 'CREATE_TDR'
    });
    return JSON.stringify(created);
  }

  async updateAsset(ctx: any, assetJson: string): Promise<string> {
    const payload = parseAssetJson(assetJson);
    const updated = await updateAsset({
      ...payload,
      txId: txIdFromCtx(ctx),
      timestamp: txTimestampFromCtx(ctx)
    });
    return JSON.stringify(updated);
  }

  async readAsset(ctx: any, application_id: string): Promise<string> {
    return JSON.stringify(await readAsset(application_id));
  }

  async getAssetByRid(ctx: any, rid: string): Promise<string> {
    const asset = await getAssetByRid(rid);
    return JSON.stringify(asset);
  }

  async getAssetHistory(ctx: any, application_id: string): Promise<string> {
    if (ctx?.stub?.getHistoryForKey) {
      const iterator = await ctx.stub.getHistoryForKey(application_id);
      const results: ChainAssetHistoryEntry[] = [];
      try {
        while (true) {
          const item = await iterator.next();
          if (item.value) {
            const tx = item.value;
            const seconds = Number(tx.timestamp?.seconds?.low ?? tx.timestamp?.seconds ?? 0);
            const nanos = Number(tx.timestamp?.nanos ?? 0);
            const timestamp = new Date(seconds * 1000 + Math.floor(nanos / 1e6)).toISOString();
            const rawValue = tx.value && tx.value.length ? tx.value.toString('utf8') : '';
            results.push({
              txId: tx.txId,
              timestamp,
              isDelete: Boolean(tx.isDelete),
              value: rawValue ? (JSON.parse(rawValue) as ChainAsset) : null
            });
          }
          if (item.done) break;
        }
      } finally {
        await iterator.close();
      }
      return JSON.stringify(results);
    }

    return JSON.stringify(await getAssetHistory(application_id));
  }

  /** Peer: `{"Args":["getHistory","<application_id>"]}` — same data as getAssetHistory */
  async getHistory(ctx: any, application_id: string): Promise<string> {
    return this.getAssetHistory(ctx, application_id);
  }

  async getAllAssets(ctx: any): Promise<string> {
    return JSON.stringify(await getAllAssets());
  }

  async assetExists(ctx: any, application_id: string): Promise<string> {
    return JSON.stringify(await assetExists(application_id));
  }


  async getAssetsByStatus(ctx: any, status: string): Promise<string> {
    return JSON.stringify(await getAssetsByStatus(status));
  }

  async getAssetsByRid(ctx: any, rid: string): Promise<string> {
    return JSON.stringify(await getAssetsByRid(rid));
  }

  async getAssetsByOwner(ctx: any, owner: string): Promise<string> {
    return JSON.stringify(await getAssetsByOwner(owner));
  }

  async getAssetsByDistrict(ctx: any, district: string): Promise<string> {
    return JSON.stringify(await getAssetsByDistrict(district));
  }
}
