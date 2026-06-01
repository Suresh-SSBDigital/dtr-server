"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTdrApplication = void 0;
const tdr_1 = __importDefault(require("../../models/tdr"));
const blockchainService_1 = require("../blockchainService");
const helpers_1 = require("./helpers");
const tdrEntityActionHistoryService_1 = require("../tdrEntityActionHistoryService");
const createTdrApplication = async (payload) => {
    const ownerId = String(payload.owner?.owner_id ?? '').trim();
    if (!ownerId) {
        const err = new Error('owner_id is required');
        err.statusCode = 400;
        err.code = 'OWNER_ID_REQUIRED';
        throw err;
    }
    const existingOwner = await tdr_1.default.findOne({ 'owner.owner_id': ownerId })
        .select({ application_id: 1 })
        .lean();
    if (existingOwner) {
        const err = new Error('same owner_id already exists');
        err.statusCode = 409;
        err.code = 'OWNER_ID_ALREADY_EXISTS';
        throw err;
    }
    const samagraId = String(payload.owner?.samagra_id ?? '').trim();
    if (!samagraId) {
        const err = new Error('samagra_id is required');
        err.statusCode = 400;
        err.code = 'SAMAGRA_ID_REQUIRED';
        throw err;
    }
    const existingSamagra = await tdr_1.default.findOne({ 'owner.samagra_id': samagraId })
        .select({ application_id: 1 })
        .lean();
    if (existingSamagra) {
        const err = new Error('same samagra_id already exists');
        err.statusCode = 409;
        err.code = 'SAMAGRA_ID_ALREADY_EXISTS';
        throw err;
    }
    const existing = await tdr_1.default.findOne({ tdrApplicationId: payload.tdrApplicationId });
    if (existing) {
        const err = new Error('tdrApplicationId already exists');
        err.statusCode = 409;
        err.code = 'TDR_APPLICATION_ID_ALREADY_EXISTS';
        throw err;
    }
    const rid = String(payload.rid).trim();
    const existingRid = await tdr_1.default.findOne({ rid }).select({ _id: 1 }).lean();
    if (existingRid) {
        const err = new Error('rid already exists');
        err.statusCode = 409;
        err.code = 'RID_ALREADY_EXISTS';
        throw err;
    }
    const application_id = (0, helpers_1.generateApplicationId)();
    const totalTdrValue = Number(payload.land?.value_tdr ?? 0);
    const totalArea = Number(payload.land?.total_area ?? 0);
    const docToInsert = {
        application_id,
        tdrApplicationId: payload.tdrApplicationId,
        rid,
        owner: payload.owner,
        project: payload.project,
        land: {
            ...payload.land,
            original_total_area: totalArea,
            proposed_area: totalArea
        },
        total_tdr_value: totalTdrValue,
        utilized_tdr_value: 0,
        remaining_tdr_value: totalTdrValue,
        remaining_area: totalArea,
        utilized_area: 0,
        plots: payload.plots ?? [],
        transfers: [],
        utilizations: [],
        documents: payload.documents ?? {}
    };
    try {
        await tdr_1.default.create(docToInsert);
    }
    catch (error) {
        if (error.code === 11000) {
            const err = new Error('Duplicate application_id, rid, or external mapping');
            err.statusCode = 409;
            err.code = 'TDR_DUPLICATE_ENTRY';
            throw err;
        }
        throw error;
    }
    const hash = (0, helpers_1.generateImportantDataHash)(payload);
    const blockchainResult = await (0, blockchainService_1.pushCreateAsset)({
        application_id,
        tdrApplicationId: payload.tdrApplicationId,
        rid,
        hash
    });
    await (0, tdrEntityActionHistoryService_1.recordTdrEntityAction)({
        samagra_id: String(payload.owner?.samagra_id ?? ''),
        rid,
        application_id,
        tdrApplicationId: payload.tdrApplicationId,
        http_method: 'POST',
        action: 'CREATE_TDR',
        route_key: 'POST /api/tdr/create',
        metadata: { owner_id: ownerId }
    });
    return {
        application_id,
        tdrApplicationId: payload.tdrApplicationId,
        samagra_id: String(payload.owner?.samagra_id ?? ''),
        rid,
        txId: blockchainResult.txId,
        hash
    };
};
exports.createTdrApplication = createTdrApplication;
//# sourceMappingURL=create.js.map