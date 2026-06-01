"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertObjectionSuggestionService = void 0;
const tdr_1 = __importDefault(require("../../models/tdr"));
const trackingKeys_1 = require("./trackingKeys");
const tdrEntityActionHistoryService_1 = require("../tdrEntityActionHistoryService");
const insertObjectionSuggestionService = async (payload) => {
    const ridNum = Number(payload.p_rid);
    if (!ridNum) {
        const err = new Error('p_rid is required');
        err.statusCode = 400;
        throw err;
    }
    const application_id = String(payload.applicationid).trim();
    const tdr = await tdr_1.default.findOne({ application_id, 'owner.samagra_id': payload.samagra_id });
    if (!tdr) {
        const err = new Error('TDR record not found for applicationid and samagra_id');
        err.statusCode = 404;
        throw err;
    }
    (0, trackingKeys_1.assertTdrTrackingKeysMatch)(tdr, {
        application_id,
        samagra_id: payload.samagra_id,
        rid: payload.rid,
        tdrApplicationId: payload.tdrApplicationId
    });
    // Stub implementation - needs to be completed with actual business logic.
    const txId = `tx_${ridNum}_${Date.now()}`;
    const hash = `hash_${ridNum}_${Date.now()}`;
    await (0, tdrEntityActionHistoryService_1.recordTdrEntityAction)({
        samagra_id: payload.samagra_id,
        rid: String(tdr.rid),
        application_id,
        tdrApplicationId: payload.tdrApplicationId,
        http_method: 'POST',
        action: 'OBJECTION_SUGGESTION',
        route_key: 'POST /api/Agency/InsertObjectionSuggestion',
        metadata: { p_rid: payload.p_rid, p_submit_status: payload.p_submit_status }
    });
    return { txId, hash, application_id };
};
exports.insertObjectionSuggestionService = insertObjectionSuggestionService;
//# sourceMappingURL=agency.js.map