"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTransferRequestService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const tdr_1 = __importDefault(require("../../models/tdr"));
const blockchainService_1 = require("../blockchainService");
const ledgerService_1 = require("../ledgerService");
const helpers_1 = require("./helpers");
const trackingKeys_1 = require("./trackingKeys");
const tdrEntityActionHistoryService_1 = require("../tdrEntityActionHistoryService");
const insertTransferRequestService = async (payload) => {
    const tdr = await (0, helpers_1.fetchTdrForOperation)(payload.application_id, payload.samagra_id);
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
    const sourceRid = String(tdr.rid);
    (0, helpers_1.validateDrcEligibility)(tdr);
    const drcCertificateNo = String(tdr.project?.drc_certificate_no ?? '').trim();
    const valuation = (0, helpers_1.resolveValuationConfig)(tdr);
    const totalTdr = Number(tdr.total_tdr_value ?? tdr.land?.value_tdr ?? 0);
    const availableTdr = typeof tdr.remaining_tdr_value === 'number'
        ? Number(tdr.remaining_tdr_value)
        : totalTdr -
            (Array.isArray(tdr.transfers) && tdr.transfers.length > 0
                ? tdr.transfers.reduce((sum, t) => sum + (t.trn_value_tdr ?? 0), 0)
                : 0) -
            (Array.isArray(tdr.utilizations) && tdr.utilizations.length > 0
                ? tdr.utilizations.reduce((sum, u) => sum + (u.utilized_value_tdr ?? 0), 0)
                : 0);
    const generatedTdrValue = Number(valuation.collector_guideline_rate) * Number(valuation.multiplier_factor) * Number(payload.transferred_area);
    const transferredTdrValue = typeof payload.trn_value_tdr === 'number' && payload.trn_value_tdr > 0 ? payload.trn_value_tdr : generatedTdrValue;
    const sourceLand = (tdr.land ?? {});
    const sourceTotalArea = Number(sourceLand.original_total_area ?? sourceLand.total_area ?? 0);
    const sourceProposedArea = Number(sourceLand.proposed_area ?? sourceTotalArea);
    const sourceRemainingArea = Number(tdr.remaining_area ?? sourceProposedArea);
    if (!Number.isFinite(sourceRemainingArea) || sourceRemainingArea <= 0) {
        const err = new Error('Source owner remaining area is invalid for transfer');
        err.statusCode = 400;
        err.code = 'INVALID_SOURCE_AREA';
        throw err;
    }
    if (payload.transferred_area > sourceRemainingArea) {
        const err = new Error('Transferred area exceeds remaining source area');
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_AREA';
        throw err;
    }
    if (transferredTdrValue > availableTdr) {
        const err = new Error('Transfer amount exceeds remaining available TDR');
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_BALANCE';
        throw err;
    }
    const remainingAfterTransfer = availableTdr - transferredTdrValue;
    const remainingSourceArea = sourceRemainingArea - payload.transferred_area;
    const { application_id: recipient_application_id, tdrApplicationId: recipient_tdrApplicationId, rid: recipient_rid } = await generateRecipientAppIdsWithSharedRid(sourceRid);
    const ownerToName = payload.owner_to ??
        payload.transferee_owner.owner_name ??
        payload.transferee_owner.name ??
        payload.owner_from;
    const transferRecord = {
        trn_id: payload.trn_id,
        owner_from: payload.owner_from,
        owner_to: ownerToName,
        trn_value_tdr: transferredTdrValue,
        original_tdr_value: availableTdr,
        transferred_tdr_value: transferredTdrValue,
        generated_tdr_value: generatedTdrValue,
        remaining_value_tdr: remainingAfterTransfer,
        transferred_area: payload.transferred_area,
        remaining_area: remainingSourceArea,
        collector_guideline_rate: valuation.collector_guideline_rate,
        multiplier_factor: valuation.multiplier_factor,
        drc_certificate_no: drcCertificateNo,
        trn_date: payload.trn_date,
        status: payload.status,
        recipient_application_id,
        recipient_rid,
        recipient_tdrApplicationId
    };
    const priorOwnerSnapshot = (0, helpers_1.deepClonePlain)((tdr.owner ?? {}));
    const recipientOwner = buildTransfereeOwner(priorOwnerSnapshot, payload);
    recipientOwner.current_balance_tdr = transferredTdrValue;
    const recipientProject = (0, helpers_1.stripDrcFromProjectForNewOwner)((0, helpers_1.deepClonePlain)((tdr.project ?? {})));
    const originalTotalArea = Number(tdr?.land?.original_total_area ??
        tdr?.land?.total_area ??
        0);
    const recipientLand = {
        ...(0, helpers_1.deepClonePlain)(sourceLand),
        total_area: payload.transferred_area,
        proposed_area: payload.transferred_area,
        original_total_area: originalTotalArea,
        value_tdr: transferredTdrValue,
        transferred_area: payload.transferred_area,
        remaining_source_area: remainingSourceArea,
        collector_guideline_rate: valuation.collector_guideline_rate,
        multiplier_factor: valuation.multiplier_factor,
        generated_tdr_value: generatedTdrValue
    };
    const recipientPlots = Array.isArray(tdr.plots) ? (0, helpers_1.deepClonePlain)(tdr.plots) : [];
    const updated = await tdr_1.default.findOneAndUpdate({ application_id: payload.application_id, rid: sourceRid }, {
        $push: { transfers: transferRecord },
        $set: {
            total_tdr_value: totalTdr,
            remaining_tdr_value: remainingAfterTransfer,
            remaining_area: remainingSourceArea,
            'owner.current_balance_tdr': remainingAfterTransfer,
            'land.original_total_area': originalTotalArea,
            'land.value_tdr': remainingAfterTransfer
        }
    }, { new: true });
    if (!updated) {
        const err = new Error('Failed to update TDR record during transfer');
        err.statusCode = 500;
        throw err;
    }
    const senderHash = (0, helpers_1.generateTransferHash)({
        application_id: payload.application_id,
        rid: sourceRid,
        land: updated.land,
        transfers: updated.transfers,
        valuation: {
            original_tdr_value: availableTdr,
            transferred_tdr_value: transferredTdrValue,
            generated_tdr_value: generatedTdrValue,
            remaining_tdr_value: remainingAfterTransfer,
            transferred_area: payload.transferred_area,
            remaining_area: remainingSourceArea,
            collector_guideline_rate: valuation.collector_guideline_rate,
            multiplier_factor: valuation.multiplier_factor
        },
        audit: {
            recipient_application_id,
            recipient_rid,
            recipient_tdrApplicationId
        }
    });
    const senderBlockchainResult = await (0, blockchainService_1.pushUpdateAsset)({
        application_id: payload.application_id,
        rid: sourceRid,
        hash: senderHash
    });
    const transfer_txId = senderBlockchainResult.txId;
    const senderLedger = (0, ledgerService_1.buildLifecycleLedgerEntry)({
        action: 'TRANSFER_OUT',
        document_type: 'TRANSFER',
        performed_by: payload.owner_from,
        previous_status: updated.project?.status,
        new_status: updated.project?.status ?? 'ACTIVE',
        remarks: `Transferred ${transferredTdrValue} TDR and ${payload.transferred_area} area to independent application ${recipient_application_id}`,
        txId: transfer_txId,
        hash: senderHash,
        source: 'API',
        changed_fields: ['transfers', 'remaining_tdr_value', 'remaining_area']
    });
    await tdr_1.default.updateOne({ application_id: payload.application_id, rid: sourceRid }, { $push: { ledger: senderLedger } });
    const recipientDoc = {
        application_id: recipient_application_id,
        tdrApplicationId: recipient_tdrApplicationId,
        rid: recipient_rid,
        owner: recipientOwner,
        project: recipientProject,
        land: recipientLand,
        plots: recipientPlots,
        total_tdr_value: transferredTdrValue,
        utilized_tdr_value: 0,
        remaining_tdr_value: transferredTdrValue,
        original_tdr_value: availableTdr,
        transferred_tdr_value: transferredTdrValue,
        generated_tdr_value: generatedTdrValue,
        remaining_area: payload.transferred_area,
        transfers: [],
        utilizations: [],
        ledger: [],
        documents: {},
        source_application_id: payload.application_id,
        source_rid: sourceRid,
        transferred_from_owner: payload.owner_from,
        transfer_txId
    };
    try {
        await tdr_1.default.create(recipientDoc);
    }
    catch (error) {
        if (error.code === 11000) {
            const err = new Error('Duplicate application mapping for transferee record');
            err.statusCode = 409;
            err.code = 'TDR_DUPLICATE_ENTRY';
            throw err;
        }
        throw error;
    }
    const recipient_asset_hash = (0, helpers_1.generateIndependentOwnerAssetHash)({
        application_id: recipient_application_id,
        tdrApplicationId: recipient_tdrApplicationId,
        rid: recipient_rid,
        owner: recipientOwner,
        project: recipientProject,
        land: recipientLand,
        plots: recipientPlots,
        source_application_id: payload.application_id,
        source_rid: sourceRid,
        transferred_from_owner: payload.owner_from,
        transfer_txId,
        trn_value_tdr: transferredTdrValue,
        transferred_area: payload.transferred_area,
        collector_guideline_rate: valuation.collector_guideline_rate,
        multiplier_factor: valuation.multiplier_factor,
        generated_tdr_value: generatedTdrValue
    });
    const recipientBlockchainResult = await (0, blockchainService_1.pushCreateAsset)({
        application_id: recipient_application_id,
        tdrApplicationId: recipient_tdrApplicationId,
        rid: recipient_rid,
        hash: recipient_asset_hash,
        remaining_tdr_value: transferredTdrValue,
        utilized_tdr_value: 0,
        owner: String(recipientOwner.name ?? ownerToName),
        district: String(recipientProject.district ?? '')
    });
    const recipientLedger = (0, ledgerService_1.buildLifecycleLedgerEntry)({
        action: 'TRANSFER_IN',
        document_type: 'TRANSFER',
        performed_by: ownerToName,
        previous_status: undefined,
        new_status: String(recipientProject.status ?? 'CREATED'),
        remarks: `Received ${transferredTdrValue} TDR and ${payload.transferred_area} area from application ${payload.application_id} (${sourceRid})`,
        txId: recipientBlockchainResult.txId,
        hash: recipient_asset_hash,
        source: 'API',
        changed_fields: ['transfers', 'total_tdr_value', 'remaining_tdr_value']
    });
    await tdr_1.default.updateOne({ application_id: recipient_application_id }, { $push: { ledger: recipientLedger } });
    await (0, tdrEntityActionHistoryService_1.recordTdrEntityAction)({
        samagra_id: payload.samagra_id,
        rid: sourceRid,
        application_id: payload.application_id,
        tdrApplicationId: payload.tdrApplicationId,
        http_method: 'POST',
        action: 'TRANSFER',
        route_key: 'POST /api/User/InsertTransferRequest',
        metadata: {
            trn_id: payload.trn_id,
            recipient_application_id,
            recipient_tdrApplicationId,
            recipient_rid,
            transfer_txId
        }
    });
    return {
        application_id: payload.application_id,
        txId: transfer_txId,
        hash: senderHash,
        old_total_area: sourceTotalArea,
        old_total_tdr: totalTdr,
        remaining_value_tdr: remainingAfterTransfer,
        old_owner_remaining_tdr: remainingAfterTransfer,
        old_owner_remaining_area: remainingSourceArea,
        transferred_tdr_value: transferredTdrValue,
        transferred_area: payload.transferred_area,
        collector_guideline_rate: valuation.collector_guideline_rate,
        multiplier_factor: valuation.multiplier_factor,
        generated_tdr_value: generatedTdrValue,
        recipient_application_id,
        recipient_tdrApplicationId,
        recipient_rid,
        new_owner_application_id: recipient_application_id,
        new_owner_tdrApplicationId: recipient_tdrApplicationId,
        new_owner_rid: recipient_rid,
        recipient_asset_txId: recipientBlockchainResult.txId,
        recipient_asset_hash,
        source_application_id: payload.application_id,
        source_rid: sourceRid,
        transferred_from_owner: payload.owner_from,
        transfer_txId
    };
};
exports.insertTransferRequestService = insertTransferRequestService;
async function generateRecipientAppIdsWithSharedRid(sharedRid) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
        const application_id = (0, helpers_1.generateApplicationId)();
        const tdrApplicationId = `TDRAPP-${Date.now()}-${crypto_1.default.randomBytes(5).toString('hex').toUpperCase()}`;
        const clash = await tdr_1.default.findOne({
            $or: [{ application_id }, { tdrApplicationId }]
        })
            .select({ application_id: 1 })
            .lean();
        if (!clash) {
            return { application_id, tdrApplicationId, rid: sharedRid };
        }
    }
    const err = new Error('Failed to allocate unique recipient application identifiers');
    err.statusCode = 500;
    throw err;
}
function buildTransfereeOwner(priorOwnerSnapshot, payload) {
    const partial = (payload.transferee_owner ?? {});
    const resolvedName = partial.owner_name ??
        partial.name ??
        payload.owner_to ??
        'NEW_OWNER';
    return {
        ...priorOwnerSnapshot,
        ...partial,
        name: resolvedName,
        owner_name: resolvedName,
        owner_id: partial.owner_id ?? `OWNER-${crypto_1.default.randomBytes(5).toString('hex')}`,
        owner_type: partial.owner_type ?? priorOwnerSnapshot.owner_type ?? 'INDIVIDUAL',
        owner_gender: partial.owner_gender ??
            partial.gender ??
            priorOwnerSnapshot.owner_gender,
        gender: partial.gender ??
            partial.owner_gender ??
            priorOwnerSnapshot.owner_gender,
        samagra_id: payload.transferee_owner.samagra_id,
        mobile: partial.mobile ?? priorOwnerSnapshot.mobile,
        email: partial.email ?? priorOwnerSnapshot.email,
        address: partial.address ?? priorOwnerSnapshot.address,
        dob: partial.dob ?? priorOwnerSnapshot.dob,
        is_first_owner: false,
        current_balance_tdr: 0
    };
}
//# sourceMappingURL=transfer.js.map