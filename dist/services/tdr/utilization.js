"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUtilizationRequestService = void 0;
const tdr_1 = __importDefault(require("../../models/tdr"));
const blockchainService_1 = require("../blockchainService");
const ledgerService_1 = require("../ledgerService");
const helpers_1 = require("./helpers");
const trackingKeys_1 = require("./trackingKeys");
const tdrEntityActionHistoryService_1 = require("../tdrEntityActionHistoryService");
const insertUtilizationRequestService = async (payload) => {
    const tdr = await fetchTdrForOperation(payload.application_id, payload.samagra_id);
    if (!tdr) {
        const err = new Error('TDR record not found for application_id and samagra_id');
        err.statusCode = 404;
        throw err;
    }
    (0, trackingKeys_1.assertTdrTrackingKeysMatch)(tdr, {
        application_id: payload.application_id,
        samagra_id: payload.samagra_id,
        rid: payload.rid,
        tdrApplicationId: payload.tdrApplicationId
    });
    const rid = String(tdr.rid);
    validateDrcEligibility(tdr);
    const valuation = (0, helpers_1.resolveValuationConfig)(tdr);
    const total = Number(tdr.total_tdr_value ?? tdr.land?.value_tdr ?? 0);
    const utilizedSoFar = Number(tdr.utilized_tdr_value ?? 0);
    const totalArea = Number(tdr?.land?.original_total_area ??
        tdr?.land?.total_area ??
        0);
    const proposedArea = Number(tdr?.land?.proposed_area ?? totalArea);
    const remainingArea = typeof tdr.remaining_area === 'number' ? Number(tdr.remaining_area) : proposedArea;
    const utilizedAreaSoFar = Number(tdr.utilized_area ?? 0);
    const remaining = typeof tdr.remaining_tdr_value === 'number'
        ? Number(tdr.remaining_tdr_value)
        : total -
            (Array.isArray(tdr.transfers) && tdr.transfers.length > 0
                ? tdr.transfers.reduce((sum, t) => sum + (t.trn_value_tdr ?? 0), 0)
                : 0) -
            (Array.isArray(tdr.utilizations) && tdr.utilizations.length > 0
                ? tdr.utilizations.reduce((sum, u) => sum + (u.utilized_value_tdr ?? 0), 0)
                : 0);
    const generatedUtilizedTdrValue = Number(valuation.collector_guideline_rate) * Number(valuation.multiplier_factor) * Number(payload.utilized_area);
    const utilizedValueTdr = typeof payload.utilized_value_tdr === 'number' && payload.utilized_value_tdr > 0
        ? payload.utilized_value_tdr
        : generatedUtilizedTdrValue;
    if (payload.utilized_area > remainingArea) {
        const err = new Error('Utilized area exceeds remaining available area');
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_AREA';
        throw err;
    }
    if (utilizedValueTdr > remaining) {
        const err = new Error('Utilized amount exceeds remaining available TDR');
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_BALANCE';
        throw err;
    }
    const beforeBalance = remaining;
    const afterBalance = remaining - utilizedValueTdr;
    const nextUtilized = utilizedSoFar + utilizedValueTdr;
    const beforeArea = remainingArea;
    const afterArea = remainingArea - payload.utilized_area;
    const nextUtilizedArea = utilizedAreaSoFar + payload.utilized_area;
    const utilizationEntry = {
        utilization_id: payload.utilization_id,
        drc_id: payload.drc_id,
        drc_certificate_no: payload.drc_certificate_no,
        utilized_by: payload.utilized_by,
        original_tdr_value: total,
        utilized_value_tdr: utilizedValueTdr,
        remaining_tdr_value: afterBalance,
        generated_utilized_tdr_value: generatedUtilizedTdrValue,
        utilized_area: payload.utilized_area,
        before_utilization_area: beforeArea,
        after_utilization_area: afterArea,
        remaining_area: afterArea,
        collector_guideline_rate: valuation.collector_guideline_rate,
        multiplier_factor: valuation.multiplier_factor,
        before_utilization_balance: beforeBalance,
        after_utilization_balance: afterBalance,
        utilization_purpose: payload.utilization_purpose,
        utilization_date: payload.utilization_date,
        status: payload.status,
        remarks: payload.remarks
    };
    const originalTotalArea = Number(tdr?.land?.original_total_area ??
        tdr?.land?.total_area ??
        0);
    const updated = await tdr_1.default.findOneAndUpdate({ application_id: payload.application_id, rid }, {
        $push: { utilizations: utilizationEntry },
        $set: {
            total_tdr_value: total,
            utilized_tdr_value: nextUtilized,
            remaining_tdr_value: afterBalance,
            utilized_area: nextUtilizedArea,
            remaining_area: afterArea,
            'owner.current_balance_tdr': afterBalance,
            'land.original_total_area': originalTotalArea,
            'land.value_tdr': afterBalance
        }
    }, { new: true });
    if (!updated) {
        const err = new Error('Failed to update TDR record during utilization');
        err.statusCode = 500;
        throw err;
    }
    const hash = (0, helpers_1.generateUtilizationHash)({
        application_id: payload.application_id,
        rid,
        balances: { total, utilized: nextUtilized, remaining: afterBalance },
        areas: { total: originalTotalArea, utilized: nextUtilizedArea, remaining: afterArea },
        valuation: {
            collector_guideline_rate: valuation.collector_guideline_rate,
            multiplier_factor: valuation.multiplier_factor,
            generated_utilized_tdr_value: generatedUtilizedTdrValue,
            utilized_tdr_value: utilizedValueTdr
        },
        utilizations: updated.utilizations,
        remarks: 'TDR utilized successfully'
    });
    const blockchainResult = await (0, blockchainService_1.pushUpdateAsset)({
        application_id: payload.application_id,
        rid,
        hash
    });
    const utilizationLedger = (0, ledgerService_1.buildLifecycleLedgerEntry)({
        action: 'UTILIZATION_ADDED',
        document_type: 'UTILIZATION',
        performed_by: payload.utilized_by,
        previous_status: updated.project?.status,
        new_status: updated.project?.status ?? 'ACTIVE',
        remarks: `Utilized ${utilizedValueTdr} TDR and ${payload.utilized_area} area for ${payload.utilization_purpose}`,
        txId: blockchainResult.txId,
        hash,
        source: 'API',
        changed_fields: ['utilizations', 'utilized_tdr_value', 'remaining_tdr_value']
    });
    await tdr_1.default.updateOne({ application_id: payload.application_id, rid }, { $push: { ledger: utilizationLedger } });
    await (0, tdrEntityActionHistoryService_1.recordTdrEntityAction)({
        samagra_id: payload.samagra_id,
        rid,
        application_id: payload.application_id,
        tdrApplicationId: payload.tdrApplicationId,
        http_method: 'POST',
        action: 'UTILIZATION',
        route_key: 'POST /api/User/InsertUtilizationRequest',
        metadata: { utilization_id: payload.utilization_id, txId: blockchainResult.txId }
    });
    return {
        txId: blockchainResult.txId,
        hash,
        utilization_id: payload.utilization_id,
        old_total_tdr: total,
        remaining_tdr_value: afterBalance,
        utilized_tdr_value: nextUtilized,
        old_total_area: originalTotalArea,
        remaining_area: afterArea,
        utilized_area: nextUtilizedArea,
        collector_guideline_rate: valuation.collector_guideline_rate,
        multiplier_factor: valuation.multiplier_factor,
        generated_utilized_tdr_value: generatedUtilizedTdrValue
    };
};
exports.insertUtilizationRequestService = insertUtilizationRequestService;
async function fetchTdrForOperation(application_id, samagra_id) {
    const tdr = await tdr_1.default.findOne({ application_id, 'owner.samagra_id': samagra_id });
    if (!tdr)
        return null;
    const externalId = tdr.tdrApplicationId;
    if (!externalId)
        return tdr;
    return tdr_1.default.findOne({ application_id, 'owner.samagra_id': samagra_id, tdrApplicationId: externalId });
}
function validateDrcEligibility(tdr) {
    const project = (tdr?.project ?? {});
    const status = String(project.status ?? '').toUpperCase();
    const isStatusAllowed = status === 'DRC_GENERATED' || status === 'ACTIVE';
    const hasDrcNo = typeof project.drc_certificate_no === 'string' && project.drc_certificate_no.trim().length > 0;
    const hasDrcDate = Boolean(project.drc_generation_dt);
    const hasDoc = hasDrcDocument(tdr?.documents);
    if (!hasDrcNo || !hasDrcDate || !hasDoc || !isStatusAllowed) {
        const err = new Error('DRC certificate not generated. Transfer/Utilization not allowed');
        err.statusCode = 409;
        err.code = 'DRC_NOT_READY';
        throw err;
    }
}
function hasDrcDocument(documents) {
    const drc = documents?.drc_certificate;
    if (!drc)
        return false;
    if (typeof drc === 'string')
        return drc.trim().length > 0;
    if (typeof drc === 'object') {
        return typeof drc.file_url === 'string' ? drc.file_url.trim().length > 0 : true;
    }
    return false;
}
//# sourceMappingURL=utilization.js.map