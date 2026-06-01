"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordTdrEntityAction = recordTdrEntityAction;
exports.listEntityActionHistoryBySamagra = listEntityActionHistoryBySamagra;
exports.listEntityActionHistoryByApplicationId = listEntityActionHistoryByApplicationId;
exports.listEntityActionHistoryByRid = listEntityActionHistoryByRid;
const tdrEntityActionHistory_1 = __importDefault(require("../models/tdrEntityActionHistory"));
/**
 * Persists an append-only audit row. Failures are logged only so core APIs stay available.
 */
async function recordTdrEntityAction(input) {
    try {
        await tdrEntityActionHistory_1.default.create({
            samagra_id: String(input.samagra_id).trim(),
            rid: String(input.rid).trim(),
            application_id: String(input.application_id).trim(),
            tdrApplicationId: String(input.tdrApplicationId).trim(),
            http_method: input.http_method,
            action: input.action,
            route_key: input.route_key,
            metadata: input.metadata
        });
    }
    catch (e) {
        console.error('[TdrEntityActionHistory] persist failed:', e instanceof Error ? e.message : e);
    }
}
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;
async function listEntityActionHistoryBySamagra(samagra_id, limit = DEFAULT_LIMIT) {
    const lim = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    return tdrEntityActionHistory_1.default.find({ samagra_id: String(samagra_id).trim() })
        .sort({ createdAt: -1 })
        .limit(lim)
        .lean();
}
async function listEntityActionHistoryByApplicationId(application_id, limit = DEFAULT_LIMIT) {
    const lim = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    return tdrEntityActionHistory_1.default.find({ application_id: String(application_id).trim() })
        .sort({ createdAt: -1 })
        .limit(lim)
        .lean();
}
async function listEntityActionHistoryByRid(rid, limit = DEFAULT_LIMIT) {
    const lim = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    return tdrEntityActionHistory_1.default.find({ rid: String(rid).trim() })
        .sort({ createdAt: -1 })
        .limit(lim)
        .lean();
}
//# sourceMappingURL=tdrEntityActionHistoryService.js.map