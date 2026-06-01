"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnerReadyForDrcService = void 0;
const tdr_1 = __importDefault(require("../../models/tdr"));
const blockchainService_1 = require("../blockchainService");
const helpers_1 = require("./helpers");
const trackingKeys_1 = require("./trackingKeys");
const tdrEntityActionHistoryService_1 = require("../tdrEntityActionHistoryService");
const updateOwnerReadyForDrcService = async (payload) => {
    const existing = await tdr_1.default.findOne({
        application_id: payload.application_id,
        'owner.samagra_id': payload.samagra_id
    });
    if (!existing) {
        const err = new Error('TDR record not found for application_id and samagra_id');
        err.statusCode = 404;
        throw err;
    }
    (0, trackingKeys_1.assertTdrTrackingKeysMatch)(existing, {
        application_id: payload.application_id,
        samagra_id: payload.samagra_id,
        rid: payload.rid,
        tdrApplicationId: payload.tdrApplicationId
    });
    const previousStatus = existing.project?.status;
    const rid = String(existing.rid);
    const hash = (0, helpers_1.generateReadyForDrcHash)({
        application_id: payload.application_id,
        rid,
        project: { status: 'READY_FOR_DRC', project_stage: 'READY_FOR_DRC' }
    });
    const blockchainResult = await (0, blockchainService_1.pushUpdateAsset)({
        application_id: payload.application_id,
        rid,
        hash
    });
    const ledgerEntry = (0, helpers_1.buildReadyForDrcLedgerEntry)({
        performed_by: payload.performed_by,
        previous_status: previousStatus,
        remarks: payload.remarks,
        txId: blockchainResult.txId,
        hash
    });
    const updated = await tdr_1.default.findOneAndUpdate({ application_id: payload.application_id, rid }, {
        $set: {
            'project.status': 'READY_FOR_DRC',
            'project.project_stage': 'READY_FOR_DRC'
        },
        $push: {
            ledger: ledgerEntry
        }
    }, { new: true });
    if (!updated) {
        const err = new Error('Failed to update READY_FOR_DRC workflow stage');
        err.statusCode = 500;
        throw err;
    }
    await (0, tdrEntityActionHistoryService_1.recordTdrEntityAction)({
        samagra_id: payload.samagra_id,
        rid,
        application_id: payload.application_id,
        tdrApplicationId: payload.tdrApplicationId,
        http_method: 'POST',
        action: 'WORKFLOW_READY_FOR_DRC',
        route_key: 'POST /api/tdr/update-owner-ready-for-drc',
        metadata: { performed_by: payload.performed_by, txId: blockchainResult.txId }
    });
    return {
        application_id: payload.application_id,
        samagra_id: payload.samagra_id,
        txId: blockchainResult.txId,
        hash
    };
};
exports.updateOwnerReadyForDrcService = updateOwnerReadyForDrcService;
//# sourceMappingURL=workflow.js.map