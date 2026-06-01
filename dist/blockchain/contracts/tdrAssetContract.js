"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TdrAssetContract = exports.getAssetsByDistrict = exports.getAssetsByOwner = exports.getAssetsByRid = exports.getAssetsByStatus = exports.deleteAsset = exports.getAllAssets = exports.getHistory = exports.getAssetHistory = exports.getAssetByRid = exports.getAsset = exports.readAsset = exports.updateAsset = exports.createAsset = exports.assetExists = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
// Fabric dependency is optional in backend runtime and available in chaincode runtime.
let ContractBase = class {
};
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ContractBase = require('fabric-contract-api').Contract;
}
catch { }
const chainStore = new Map();
const ridIndex = new Map();
const historyStore = new Map();
const nowIso = () => new Date().toISOString();
const nextTxId = () => `sim-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
const statusCodeError = (message, statusCode) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};
const appendHistory = (application_id, entry) => {
    const current = historyStore.get(application_id) ?? [];
    current.push(entry);
    historyStore.set(application_id, current);
};
const parseAssetJson = (assetJson) => {
    if (!assetJson)
        throw new Error('assetJson is required');
    return JSON.parse(assetJson);
};
const txTimestampFromCtx = (ctx) => {
    const ts = ctx?.stub?.getTxTimestamp?.();
    if (!ts)
        return nowIso();
    const seconds = Number(ts.seconds?.low ?? ts.seconds ?? 0);
    const nanos = Number(ts.nanos ?? 0);
    return new Date(seconds * 1000 + Math.floor(nanos / 1e6)).toISOString();
};
const formatAsiaKolkataIso = (date) => {
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
    const get = (type) => parts.find((p) => p.type === type)?.value ?? '00';
    const yyyy = get('year');
    const mm = get('month');
    const dd = get('day');
    const HH = get('hour');
    const MM = get('minute');
    const SS = get('second');
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}.000+05:30`;
};
const txIdFromCtx = (ctx) => {
    return ctx?.stub?.getTxID?.() ?? nextTxId();
};
const assetExists = async (application_id) => chainStore.has(application_id);
exports.assetExists = assetExists;
const createAsset = async (asset) => {
    if (!asset.application_id)
        throw statusCodeError('application_id is required', 400);
    if (!asset.rid)
        throw statusCodeError('rid is required', 400);
    if (!asset.hash)
        throw statusCodeError('hash is required', 400);
    if (await (0, exports.assetExists)(asset.application_id))
        throw statusCodeError('Blockchain asset already exists for application_id', 409);
    // Same RID may appear on multiple chain assets (e.g. transfer recipient reuses source RID); index first match only.
    if (!ridIndex.has(asset.rid))
        ridIndex.set(asset.rid, asset.application_id);
    const timestamp = asset.timestamp ?? nowIso();
    const created = {
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
exports.createAsset = createAsset;
const updateAsset = async (asset) => {
    const existing = chainStore.get(asset.application_id);
    if (!existing)
        throw statusCodeError('Blockchain asset not found for application_id', 404);
    if (existing.rid !== asset.rid)
        throw statusCodeError('RID mismatch for blockchain asset update', 400);
    const updated = {
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
exports.updateAsset = updateAsset;
const readAsset = async (application_id) => {
    const asset = chainStore.get(application_id);
    if (!asset)
        throw statusCodeError('Blockchain asset not found for application_id', 404);
    return asset;
};
exports.readAsset = readAsset;
const getAsset = async (application_id) => chainStore.get(application_id) ?? null;
exports.getAsset = getAsset;
const getAssetByRid = async (rid) => {
    const viaIndex = ridIndex.get(rid);
    if (viaIndex) {
        const a = chainStore.get(viaIndex);
        if (a?.rid === rid)
            return a;
    }
    for (const a of chainStore.values()) {
        if (a.rid === rid)
            return a;
    }
    return null;
};
exports.getAssetByRid = getAssetByRid;
const getAssetHistory = async (application_id) => historyStore.get(application_id) ?? [];
exports.getAssetHistory = getAssetHistory;
/** Alias for Fabric chaincode / peers: `getHistory` */
exports.getHistory = exports.getAssetHistory;
const getAllAssets = async () => Array.from(chainStore.values());
exports.getAllAssets = getAllAssets;
const deleteAsset = async (application_id) => {
    const asset = chainStore.get(application_id);
    if (!asset)
        throw statusCodeError('Blockchain asset not found for application_id', 404);
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
exports.deleteAsset = deleteAsset;
const getAssetsByStatus = async (status) => Array.from(chainStore.values()).filter((a) => a.status === status);
exports.getAssetsByStatus = getAssetsByStatus;
const getAssetsByRid = async (rid) => Array.from(chainStore.values()).filter((a) => a.rid === rid);
exports.getAssetsByRid = getAssetsByRid;
const getAssetsByOwner = async (owner) => Array.from(chainStore.values()).filter((a) => a.owner === owner);
exports.getAssetsByOwner = getAssetsByOwner;
const getAssetsByDistrict = async (district) => Array.from(chainStore.values()).filter((a) => a.district === district);
exports.getAssetsByDistrict = getAssetsByDistrict;
class TdrAssetContract extends ContractBase {
    constructor() {
        super('TdrAssetContract');
    }
    async createAsset(ctx, assetJson) {
        const payload = parseAssetJson(assetJson);
        const created = await (0, exports.createAsset)({
            ...payload,
            txId: txIdFromCtx(ctx),
            timestamp: txTimestampFromCtx(ctx),
            status: payload.status ?? 'CREATED',
            lastAction: payload.lastAction ?? 'CREATE_TDR'
        });
        return JSON.stringify(created);
    }
    async updateAsset(ctx, assetJson) {
        const payload = parseAssetJson(assetJson);
        const updated = await (0, exports.updateAsset)({
            ...payload,
            txId: txIdFromCtx(ctx),
            timestamp: txTimestampFromCtx(ctx)
        });
        return JSON.stringify(updated);
    }
    async readAsset(ctx, application_id) {
        return JSON.stringify(await (0, exports.readAsset)(application_id));
    }
    async getAssetByRid(ctx, rid) {
        const asset = await (0, exports.getAssetByRid)(rid);
        return JSON.stringify(asset);
    }
    async getAssetHistory(ctx, application_id) {
        if (ctx?.stub?.getHistoryForKey) {
            const iterator = await ctx.stub.getHistoryForKey(application_id);
            const results = [];
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
                            value: rawValue ? JSON.parse(rawValue) : null
                        });
                    }
                    if (item.done)
                        break;
                }
            }
            finally {
                await iterator.close();
            }
            return JSON.stringify(results);
        }
        return JSON.stringify(await (0, exports.getAssetHistory)(application_id));
    }
    /** Peer: `{"Args":["getHistory","<application_id>"]}` — same data as getAssetHistory */
    async getHistory(ctx, application_id) {
        return this.getAssetHistory(ctx, application_id);
    }
    async getAllAssets(ctx) {
        return JSON.stringify(await (0, exports.getAllAssets)());
    }
    async assetExists(ctx, application_id) {
        return JSON.stringify(await (0, exports.assetExists)(application_id));
    }
    async getAssetsByStatus(ctx, status) {
        return JSON.stringify(await (0, exports.getAssetsByStatus)(status));
    }
    async getAssetsByRid(ctx, rid) {
        return JSON.stringify(await (0, exports.getAssetsByRid)(rid));
    }
    async getAssetsByOwner(ctx, owner) {
        return JSON.stringify(await (0, exports.getAssetsByOwner)(owner));
    }
    async getAssetsByDistrict(ctx, district) {
        return JSON.stringify(await (0, exports.getAssetsByDistrict)(district));
    }
}
exports.TdrAssetContract = TdrAssetContract;
//# sourceMappingURL=tdrAssetContract.js.map