"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApplicationId = generateApplicationId;
exports.generateImportantDataHash = generateImportantDataHash;
exports.generateDrcUpdateHash = generateDrcUpdateHash;
exports.generateTransferHash = generateTransferHash;
exports.generateIndependentOwnerAssetHash = generateIndependentOwnerAssetHash;
exports.deepClonePlain = deepClonePlain;
exports.stripDrcFromProjectForNewOwner = stripDrcFromProjectForNewOwner;
exports.fetchTdrForOperation = fetchTdrForOperation;
exports.hasDrcDocument = hasDrcDocument;
exports.resolveValuationConfig = resolveValuationConfig;
exports.buildAreaTdrSummary = buildAreaTdrSummary;
exports.validateDrcEligibility = validateDrcEligibility;
exports.generateUtilizationHash = generateUtilizationHash;
exports.generateNewDrcOwnerHash = generateNewDrcOwnerHash;
exports.generateReadyForDrcHash = generateReadyForDrcHash;
exports.buildReadyForDrcLedgerEntry = buildReadyForDrcLedgerEntry;
const crypto_1 = __importDefault(require("crypto"));
const tdr_1 = __importDefault(require("../../models/tdr"));
function generateApplicationId() {
    return `TDR-${Date.now()}-${crypto_1.default.randomBytes(6).toString('hex').toUpperCase()}`;
}
function generateImportantDataHash(payload) {
    const hashInput = {
        rid: payload.rid,
        owner: payload.owner,
        project: payload.project,
        land: payload.land
    };
    return crypto_1.default.createHash('sha256').update(JSON.stringify(hashInput)).digest('hex');
}
function generateDrcUpdateHash(input) {
    return crypto_1.default.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
function generateTransferHash(input) {
    return crypto_1.default.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
function generateIndependentOwnerAssetHash(input) {
    return crypto_1.default.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
function deepClonePlain(value) {
    return JSON.parse(JSON.stringify(value));
}
function stripDrcFromProjectForNewOwner(project) {
    const next = { ...project };
    delete next.drc_certificate_no;
    delete next.drc_id;
    delete next.drc_generation_dt;
    next.status = 'CREATED';
    return next;
}
async function fetchTdrForOperation(application_id, samagra_id) {
    const tdr = await tdr_1.default.findOne({ application_id, 'owner.samagra_id': samagra_id });
    if (!tdr)
        return null;
    const externalId = tdr.tdrApplicationId;
    if (!externalId)
        return tdr;
    return tdr_1.default.findOne({ application_id, 'owner.samagra_id': samagra_id, tdrApplicationId: externalId });
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
function resolveValuationConfig(tdr) {
    const project = (tdr?.project ?? {});
    const land = (tdr?.land ?? {});
    const collectorGuidelineRate = Number(project.collector_guideline_rate ??
        land.collector_guideline_rate ??
        process.env.DEFAULT_COLLECTOR_GUIDELINE_RATE ??
        0);
    const multiplierFactor = Number(project.multiplier_factor ?? land.multiplier_factor ?? process.env.DEFAULT_MULTIPLIER_FACTOR ?? 1);
    if (!Number.isFinite(collectorGuidelineRate) || collectorGuidelineRate <= 0) {
        const err = new Error('Collector guideline rate is missing in project/land/master valuation config');
        err.statusCode = 400;
        err.code = 'VALUATION_CONFIG_MISSING';
        throw err;
    }
    if (!Number.isFinite(multiplierFactor) || multiplierFactor <= 0) {
        const err = new Error('Multiplier factor is missing in project/land/master valuation config');
        err.statusCode = 400;
        err.code = 'VALUATION_CONFIG_MISSING';
        throw err;
    }
    return { collector_guideline_rate: collectorGuidelineRate, multiplier_factor: multiplierFactor };
}
function buildAreaTdrSummary(row) {
    const transferred_tdr_value = Array.isArray(row?.transfers)
        ? row.transfers.reduce((sum, t) => sum + Number(t?.transferred_tdr_value ?? t?.trn_value_tdr ?? 0), 0)
        : 0;
    const utilized_tdr_value = Array.isArray(row?.utilizations)
        ? row.utilizations.reduce((sum, u) => sum + Number(u?.utilized_value_tdr ?? 0), 0)
        : Number(row?.utilized_tdr_value ?? 0);
    const transferred_area = Array.isArray(row?.transfers)
        ? row.transfers.reduce((sum, t) => sum + Number(t?.transferred_area ?? 0), 0)
        : 0;
    const utilized_area = Array.isArray(row?.utilizations)
        ? row.utilizations.reduce((sum, u) => sum + Number(u?.utilized_area ?? 0), 0)
        : Number(row?.utilized_area ?? 0);
    let total_area = Number(row?.original_total_area ?? row?.land?.original_total_area ?? row?.land?.total_area ?? 0);
    if (!(total_area > 0) && Array.isArray(row?.plots) && row.plots.length > 0) {
        total_area = row.plots.reduce((sum, p) => sum + Number(p?.registry_area ?? p?.proposed_area ?? 0), 0);
    }
    const proposed_area = Number(row?.land?.proposed_area ?? 0);
    const storedRemaining = row?.remaining_area;
    const calculatedRemaining = Math.max(0, total_area - transferred_area - utilized_area);
    const remaining_area = typeof storedRemaining === 'number' && Number.isFinite(storedRemaining)
        ? storedRemaining
        : total_area > 0
            ? calculatedRemaining
            : Number(proposed_area ?? 0);
    const total_tdr_value = Number(row?.total_tdr_value ?? row?.land?.value_tdr ?? 0);
    const remaining_tdr_value = Number(row?.remaining_tdr_value ?? 0);
    return {
        total_area,
        proposed_area,
        remaining_area,
        utilized_area,
        transferred_area,
        total_tdr_value,
        remaining_tdr_value,
        utilized_tdr_value,
        transferred_tdr_value
    };
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
function generateUtilizationHash(input) {
    return crypto_1.default.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
function generateNewDrcOwnerHash(input) {
    return crypto_1.default.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
function generateReadyForDrcHash(input) {
    return crypto_1.default.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
function buildReadyForDrcLedgerEntry(params) {
    return {
        action: 'READY_FOR_DRC',
        performed_by: params.performed_by,
        previous_status: params.previous_status,
        new_status: 'READY_FOR_DRC',
        remarks: params.remarks,
        txId: params.txId,
        hash: params.hash,
        createdAt: new Date(),
        source: 'API',
        changed_fields: ['project.status']
    };
}
//# sourceMappingURL=helpers.js.map