"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLedgerHash = exports.getLedgerSnapshot = exports.uploadLifecycleDocument = void 0;
const tdr_1 = __importDefault(require("../models/tdr"));
const hashService_1 = require("./hashService");
const blockchainService_1 = require("./blockchainService");
const ledgerService_1 = require("./ledgerService");
function httpError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
const uploadLifecycleDocument = async (payload) => {
    const tdr = await tdr_1.default.findOne({
        application_id: payload.application_id,
        'owner.samagra_id': payload.samagra_id
    });
    if (!tdr)
        throw httpError(404, 'TDR record not found for application_id and samagra_id');
    const rid = String(tdr.rid);
    const uploaded_at = new Date();
    const docHash = await (0, hashService_1.generateDataHash)({
        application_id: payload.application_id,
        rid,
        document_type: payload.document_type,
        file_url: payload.file_url,
        uploaded_at: uploaded_at.toISOString(),
        utilized_tdr: payload.utilized_tdr,
        ledger_snapshot: payload.ledger_snapshot,
        utilization_id: payload.utilization_id,
        drc_id: payload.drc_id,
        drc_certificate_no: payload.drc_certificate_no,
        approval_authority: payload.approval_authority
    });
    const setPayload = {
        [`documents.${payload.document_type}`]: {
            file_url: payload.file_url,
            hash: docHash,
            uploaded_at,
            ...(typeof payload.utilized_tdr === 'number' ? { utilized_tdr: payload.utilized_tdr } : {}),
            ...(typeof payload.ledger_snapshot === 'number' ? { ledger_snapshot: payload.ledger_snapshot } : {}),
            ...(payload.utilization_id ? { utilization_id: payload.utilization_id } : {}),
            ...(payload.drc_id ? { drc_id: payload.drc_id } : {}),
            ...(payload.drc_certificate_no ? { drc_certificate_no: payload.drc_certificate_no } : {}),
            ...(payload.approval_authority ? { approval_authority: payload.approval_authority } : {})
        }
    };
    if (payload.document_type === 'form12') {
        setPayload['project.status'] = 'UTILIZATION_FINALIZED';
    }
    if (payload.document_type === 'form13') {
        const snapshot = Number(payload.ledger_snapshot ?? tdr.remaining_tdr_value ?? 0);
        setPayload.remaining_tdr_value = snapshot;
        setPayload.utilized_tdr_value = Number(tdr.total_tdr_value ?? 0) - snapshot;
    }
    const updated = await tdr_1.default.findOneAndUpdate({ application_id: payload.application_id, rid }, { $set: setPayload }, { new: true });
    if (!updated)
        throw httpError(500, 'Failed to update document lifecycle');
    const lifecycleHash = await (0, hashService_1.generateDataHash)({
        application_id: payload.application_id,
        rid,
        document_type: payload.document_type,
        document: updated.documents?.[payload.document_type],
        status: updated.project?.status,
        balances: {
            total_tdr_value: updated.total_tdr_value,
            utilized_tdr_value: updated.utilized_tdr_value,
            remaining_tdr_value: updated.remaining_tdr_value
        }
    });
    const chain = await (0, blockchainService_1.pushUpdateAsset)({
        application_id: payload.application_id,
        rid,
        hash: lifecycleHash
    });
    const ledgerEntry = (0, ledgerService_1.buildLedgerEntry)({
        action: `${payload.document_type.toUpperCase()}_UPLOADED`,
        document_type: payload.document_type.toUpperCase(),
        performed_by: payload.performed_by,
        previous_status: tdr.project?.status,
        new_status: updated.project?.status ?? 'UPDATED',
        remarks: payload.remarks,
        txId: chain.txId,
        hash: lifecycleHash
    });
    await tdr_1.default.findOneAndUpdate({ application_id: payload.application_id, rid }, { $push: { ledger: ledgerEntry } });
    return {
        txId: chain.txId,
        hash: lifecycleHash,
        application_id: payload.application_id,
        rid
    };
};
exports.uploadLifecycleDocument = uploadLifecycleDocument;
const getLedgerSnapshot = async (application_id, samagra_id) => {
    const tdr = await tdr_1.default.findOne({ application_id, 'owner.samagra_id': samagra_id }, { ledger: 1, remaining_tdr_value: 1, utilized_tdr_value: 1, total_tdr_value: 1 });
    if (!tdr)
        throw httpError(404, 'TDR record not found for application_id and samagra_id');
    return tdr;
};
exports.getLedgerSnapshot = getLedgerSnapshot;
const generateLedgerHash = async (application_id, samagra_id) => {
    const tdr = await tdr_1.default.findOne({ application_id, 'owner.samagra_id': samagra_id }, { rid: 1, ledger: 1, remaining_tdr_value: 1, utilized_tdr_value: 1, total_tdr_value: 1 });
    if (!tdr)
        throw httpError(404, 'TDR record not found for application_id and samagra_id');
    const rid = String(tdr.rid);
    const hash = await (0, hashService_1.generateDataHash)({
        application_id,
        rid,
        ledger: tdr.ledger ?? [],
        balances: {
            total_tdr_value: tdr.total_tdr_value,
            utilized_tdr_value: tdr.utilized_tdr_value,
            remaining_tdr_value: tdr.remaining_tdr_value
        }
    });
    return { hash, snapshot: tdr };
};
exports.generateLedgerHash = generateLedgerHash;
//# sourceMappingURL=tdrDocumentService.js.map