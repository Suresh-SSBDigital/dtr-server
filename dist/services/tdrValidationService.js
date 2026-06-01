"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSourceDataAgainstBlockchain = validateSourceDataAgainstBlockchain;
const blockchainService_1 = require("./blockchainService");
const externalTdrApiService_1 = require("./externalTdrApiService");
const hashGenerator_1 = require("../utils/hashGenerator");
function diffFields(path, a, b, out) {
    if (out.length > 50)
        return;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length)
            out.push(path);
        const size = Math.min(a.length, b.length);
        for (let i = 0; i < size; i += 1)
            diffFields(`${path}[${i}]`, a[i], b[i], out);
        return;
    }
    if (a && typeof a === 'object' && b && typeof b === 'object') {
        const ao = a;
        const bo = b;
        const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
        for (const key of keys)
            diffFields(path ? `${path}.${key}` : key, ao[key], bo[key], out);
        return;
    }
    if (a !== b)
        out.push(path || 'root');
}
function fieldLevelMismatches(source, chainAsset) {
    const out = [];
    diffFields('owner', source.owner, chainAsset.owner, out);
    diffFields('land', source.land, chainAsset.land, out);
    diffFields('project.status', source.project?.status, chainAsset.status, out);
    const util = source.utilization;
    if (Array.isArray(util)) {
        const totalUtilized = util.reduce((sum, row) => {
            const value = Number(row?.utilized_value_tdr ?? row?.value_tdr ?? 0);
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);
        const chainUtilized = Number(chainAsset.utilized_tdr_value ?? 0);
        if (totalUtilized !== chainUtilized)
            out.push('utilization balance');
    }
    const transfers = source.transfers;
    if (Array.isArray(transfers) && transfers.length > 0) {
        const firstTransfer = transfers[0];
        if (firstTransfer.owner_to && firstTransfer.owner_to !== chainAsset.owner)
            out.push('transfer owner');
    }
    return [...new Set(out)].slice(0, 50);
}
async function validateSourceDataAgainstBlockchain(application_id, samagra_id) {
    const validation_timestamp = new Date().toISOString();
    const externalRaw = await (0, externalTdrApiService_1.fetchOfficialExternalData)(application_id, samagra_id);
    const normalized = (0, externalTdrApiService_1.normalizeExternalSourceData)(externalRaw);
    const external_hash = (0, hashGenerator_1.generateDeterministicHash)({
        application_id,
        samagra_id,
        ...normalized
    });
    const assetByApp = await (0, blockchainService_1.fetchAssetByApplicationId)(application_id);
    if (!assetByApp) {
        const err = new Error('Blockchain asset not found for application_id');
        err.statusCode = 404;
        throw err;
    }
    const blockchain_hash = assetByApp.hash;
    const match = external_hash === blockchain_hash;
    console.info('[AUDIT] source-validation', {
        application_id,
        samagra_id,
        validation_timestamp,
        txId: assetByApp.txId,
        external_hash,
        blockchain_hash,
        result: match ? 'MATCH' : 'MISMATCH'
    });
    if (match) {
        return {
            success: true,
            valid: true,
            tampered: false,
            blockchain_verified: true,
            validation_timestamp,
            txId: assetByApp.txId,
            external_hash,
            blockchain_hash
        };
    }
    const tampered_fields = fieldLevelMismatches(normalized, assetByApp);
    return {
        success: false,
        valid: false,
        tampered: true,
        blockchain_verified: false,
        reason: 'DATA_TAMPERED',
        mismatch_source: 'EXTERNAL_SYSTEM',
        tampered_fields,
        validation_timestamp,
        txId: assetByApp.txId,
        external_hash,
        blockchain_hash
    };
}
//# sourceMappingURL=tdrValidationService.js.map