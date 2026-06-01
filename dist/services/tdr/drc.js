"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newDrcOfOwnerService = exports.updateDrcService = void 0;
const tdr_1 = __importDefault(require("../../models/tdr"));
const blockchainService_1 = require("../blockchainService");
const hashService_1 = require("../hashService");
const helpers_1 = require("./helpers");
const trackingKeys_1 = require("./trackingKeys");
const tdrEntityActionHistoryService_1 = require("../tdrEntityActionHistoryService");
const updateDrcService = async (payload) => {
    const duplicateDrc = await tdr_1.default.findOne({
        $or: [
            { 'project.drc_certificate_no': payload.drc_certificate_no },
            { 'project.drc_certificate_id': payload.drc_id },
            { 'project.drc_id': payload.drc_id }
        ],
        application_id: { $ne: payload.application_id }
    }).lean();
    if (duplicateDrc) {
        const err = new Error('This DRC certificate is already linked with another application.');
        err.statusCode = 409;
        err.code = 'DUPLICATE_DRC';
        throw err;
    }
    const uploadedAt = new Date();
    const existingTdr = await tdr_1.default.findOne({
        application_id: payload.application_id,
        'owner.samagra_id': payload.samagra_id
    });
    if (!existingTdr) {
        const err = new Error('TDR record not found for application_id and samagra_id');
        err.statusCode = 404;
        throw err;
    }
    (0, trackingKeys_1.assertTdrTrackingKeysMatch)(existingTdr, {
        application_id: payload.application_id,
        samagra_id: payload.samagra_id,
        rid: payload.rid,
        tdrApplicationId: payload.tdrApplicationId
    });
    const rid = String(existingTdr.rid);
    const form4Hash = await (0, hashService_1.generateDataHash)({
        application_id: payload.application_id,
        rid,
        document_type: 'FORM4',
        file_url: payload.form4,
        uploaded_at: uploadedAt.toISOString()
    });
    const drcHash = await (0, hashService_1.generateDataHash)({
        application_id: payload.application_id,
        rid,
        document_type: 'DRC_CERTIFICATE',
        file_url: payload.drc_certificate,
        uploaded_at: uploadedAt.toISOString()
    });
    const updated = await tdr_1.default.findOneAndUpdate({ application_id: payload.application_id, rid }, {
        $set: {
            'project.drc_id': payload.drc_id,
            'project.drc_certificate_no': payload.drc_certificate_no,
            'project.drc_generation_dt': payload.drc_generation_dt,
            'project.status': 'DRC_GENERATED',
            'documents.form4': { file_url: payload.form4, hash: form4Hash, uploaded_at: uploadedAt },
            'documents.drc_certificate': {
                file_url: payload.drc_certificate,
                hash: drcHash,
                uploaded_at: uploadedAt
            }
        }
    }, { new: true });
    if (!updated) {
        const err = new Error('TDR record not found for application_id and samagra_id');
        err.statusCode = 404;
        throw err;
    }
    const hash = (0, helpers_1.generateDrcUpdateHash)({
        project: updated.project,
        documents: updated.documents,
        drc: {
            drc_id: payload.drc_id,
            drc_certificate_no: payload.drc_certificate_no,
            drc_generation_dt: payload.drc_generation_dt
        }
    });
    const blockchainResult = await (0, blockchainService_1.pushUpdateAsset)({
        application_id: payload.application_id,
        rid,
        hash
    });
    await (0, tdrEntityActionHistoryService_1.recordTdrEntityAction)({
        samagra_id: payload.samagra_id,
        rid,
        application_id: payload.application_id,
        tdrApplicationId: payload.tdrApplicationId,
        http_method: 'PUT',
        action: 'UPDATE_DRC',
        route_key: 'PUT|POST /api/tdr/drc',
        metadata: { drc_id: payload.drc_id, drc_certificate_no: payload.drc_certificate_no, txId: blockchainResult.txId }
    });
    return {
        application_id: payload.application_id,
        txId: blockchainResult.txId,
        hash
    };
};
exports.updateDrcService = updateDrcService;
const newDrcOfOwnerService = async (payload) => {
    const tdr = await tdr_1.default.findOne({
        application_id: payload.application_id,
        'owner.samagra_id': payload.samagra_id
    });
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
    const application_id = String(tdr.application_id);
    const drcCertificateNo = String(payload.drc_certificate_no).trim();
    const drcId = String(payload.drc_id).trim();
    if (!drcCertificateNo) {
        const err = new Error('drc_certificate_no is required');
        err.statusCode = 400;
        throw err;
    }
    if (!drcId) {
        const err = new Error('drc_id is required');
        err.statusCode = 400;
        throw err;
    }
    const duplicateDrcCertNo = await tdr_1.default.findOne({
        'owner.samagra_id': payload.samagra_id,
        $or: [{ 'project.drc_certificate_no': drcCertificateNo }, { 'new_drc_of_owner.drc_certificate_no': drcCertificateNo }]
    })
        .select({ application_id: 1 })
        .lean();
    if (duplicateDrcCertNo) {
        const err = new Error('same DRC certificate number cannot be reused for same Samagra owner');
        err.statusCode = 409;
        err.code = 'DRC_CERTIFICATE_REUSE';
        throw err;
    }
    const duplicateDrcId = await tdr_1.default.findOne({
        'owner.samagra_id': payload.samagra_id,
        $or: [{ 'project.drc_id': drcId }, { 'new_drc_of_owner.drc_id': drcId }]
    })
        .select({ application_id: 1 })
        .lean();
    if (duplicateDrcId) {
        const err = new Error('same drc_id cannot be reused for same Samagra owner');
        err.statusCode = 409;
        err.code = 'DRC_ID_REUSE';
        throw err;
    }
    const existingTdrValue = Number(tdr?.remaining_tdr_value ?? tdr?.total_tdr_value ?? 0);
    const drcGenerationDt = payload.drc_generation_dt ? new Date(payload.drc_generation_dt) : new Date();
    const uploadedAt = new Date();
    const drcDocHash = await (0, hashService_1.generateDataHash)({
        application_id,
        rid: String(tdr.rid),
        document_type: 'DRC_CERTIFICATE',
        file_url: payload.drc_certificate_doc_path,
        uploaded_at: uploadedAt.toISOString()
    });
    const priorOwnerId = tdr?.owner?.owner_id;
    const incomingOwnerId = String(payload.owner_id ?? '').trim();
    if (!incomingOwnerId) {
        const err = new Error('owner_id is required');
        err.statusCode = 400;
        err.code = 'OWNER_ID_REQUIRED';
        throw err;
    }
    if (priorOwnerId && String(priorOwnerId).trim() !== incomingOwnerId) {
        const err = new Error('Owner id mismatch: new DRC owner_id must match existing TDR owner id');
        err.statusCode = 409;
        err.code = 'OWNER_ID_MISMATCH';
        throw err;
    }
    const finalTdrValue = Number(payload.tdr_value || existingTdrValue);
    const newDrcRecord = {
        querytype: payload.querytype,
        owner_id: payload.owner_id,
        drc_certificate_doc_name: payload.drc_certificate_doc_name,
        drc_certificate_doc_path: payload.drc_certificate_doc_path,
        drc_receipt_no: payload.drc_receipt_no,
        drc_file_no: payload.drc_file_no,
        isSigned: payload.isSigned,
        application_id,
        is_digital_sign: payload.is_digital_sign,
        tdr_value: String(finalTdrValue),
        collector_guideline_rate: payload.collector_guideline_rate,
        multiplier_factor: payload.multiplier_factor,
        drc_id: drcId,
        drc_certificate_no: drcCertificateNo,
        drc_generation_dt: drcGenerationDt
    };
    const updated = await tdr_1.default.findOneAndUpdate({ application_id, 'owner.samagra_id': payload.samagra_id }, {
        $push: { new_drc_of_owner: newDrcRecord },
        $set: {
            'project.drc_id': drcId,
            'project.drc_certificate_no': drcCertificateNo,
            'project.drc_generation_dt': drcGenerationDt,
            'project.status': 'DRC_GENERATED',
            'project.collector_guideline_rate': payload.collector_guideline_rate,
            'project.multiplier_factor': payload.multiplier_factor,
            total_tdr_value: finalTdrValue,
            remaining_tdr_value: finalTdrValue,
            'land.value_tdr': finalTdrValue,
            'owner.current_balance_tdr': finalTdrValue,
            'documents.drc_certificate': {
                file_url: payload.drc_certificate_doc_path,
                hash: drcDocHash,
                uploaded_at: uploadedAt
            }
        }
    }, { new: true });
    if (!updated) {
        const err = new Error('Failed to update TDR record for NewDRCOfOwner');
        err.statusCode = 500;
        throw err;
    }
    const hash = (0, helpers_1.generateNewDrcOwnerHash)({
        application_id,
        owner_id: payload.owner_id,
        drc_certificate_no: drcCertificateNo,
        collector_guideline_rate: payload.collector_guideline_rate,
        multiplier_factor: payload.multiplier_factor,
        new_drc_of_owner: updated.new_drc_of_owner ?? []
    });
    let blockchainResult;
    try {
        blockchainResult = await (0, blockchainService_1.pushUpdateAsset)({
            application_id,
            rid: updated.rid,
            hash
        });
    }
    catch (e) {
        const err = new Error('NewDRC upload saved in Mongo but blockchain push failed (please retry)');
        err.statusCode = 409;
        err.code = 'BLOCKCHAIN_PUSH_FAILED_CLEAR_MISSING_OK';
        throw err;
    }
    await (0, tdrEntityActionHistoryService_1.recordTdrEntityAction)({
        samagra_id: payload.samagra_id,
        rid: String(updated.rid),
        application_id,
        tdrApplicationId: payload.tdrApplicationId,
        http_method: 'POST',
        action: 'NEW_DRC_OF_OWNER',
        route_key: 'POST /api/User/NewDRCOfOwner',
        metadata: { drc_id: drcId, drc_certificate_no: drcCertificateNo, txId: blockchainResult.txId }
    });
    return {
        application_id,
        samagra_id: payload.samagra_id,
        txId: blockchainResult.txId,
        hash,
        drc_id: drcId,
        drc_certificate_no: drcCertificateNo,
        drc_generation_dt: drcGenerationDt
    };
};
exports.newDrcOfOwnerService = newDrcOfOwnerService;
//# sourceMappingURL=drc.js.map