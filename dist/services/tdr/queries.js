"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDrcCertificatesService = exports.getBlockchainHistoryForApplicationService = exports.getAllHistoryByRidService = exports.getAllDrcInfoByRidService = exports.getDrcDetailsByIdService = exports.getTdrFullByApplicationAndSamagraService = exports.getAllApplicationsHistoryListService = exports.getAllApplicationsService = exports.getTdrHistoryService = void 0;
const tdr_1 = __importDefault(require("../../models/tdr"));
const blockchainService_1 = require("../blockchainService");
const helpers_1 = require("./helpers");
const getTdrHistoryService = async (application_id) => {
    const tdr = await tdr_1.default.findOne({ application_id });
    if (!tdr) {
        const err = new Error('TDR record not found for application_id');
        err.statusCode = 404;
        throw err;
    }
    return {
        application_id,
        tdr,
        history: await (0, blockchainService_1.fetchAssetHistory)(application_id)
    };
};
exports.getTdrHistoryService = getTdrHistoryService;
const getAllApplicationsService = async () => {
    const rows = await tdr_1.default.find({}, {
        application_id: 1,
        tdrApplicationId: 1,
        rid: 1,
        owner: 1,
        project: 1,
        total_tdr_value: 1,
        utilized_tdr_value: 1,
        remaining_tdr_value: 1,
        createdAt: 1,
        updatedAt: 1
    })
        .sort({ createdAt: -1 })
        .lean();
    return rows.map((row) => ({
        application_id: row.application_id,
        tdrApplicationId: row.tdrApplicationId,
        rid: row.rid,
        owner_name: row.owner?.name,
        district: row.project?.district,
        status: row.project?.status,
        total_tdr_value: row.total_tdr_value,
        utilized_tdr_value: row.utilized_tdr_value,
        remaining_tdr_value: row.remaining_tdr_value,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    }));
};
exports.getAllApplicationsService = getAllApplicationsService;
const getAllApplicationsHistoryListService = async () => {
    const rows = await tdr_1.default.find({}).sort({ createdAt: -1 }).lean();
    const applications = await Promise.all(rows.map(async (row) => {
        const blockchain_history = await (0, blockchainService_1.fetchAssetHistory)(row.application_id);
        const transfers = Array.isArray(row.transfers) ? row.transfers : [];
        const utilizations = Array.isArray(row.utilizations) ? row.utilizations : [];
        return {
            application_id: row.application_id,
            tdrApplicationId: row.tdrApplicationId,
            rid: row.rid,
            samagra_id: row.owner?.samagra_id,
            owner_name: row.owner?.name,
            source_application_id: row.source_application_id,
            district: row.project?.district,
            tehsil: row.project?.tehsil,
            status: row.project?.status,
            ...(0, helpers_1.buildAreaTdrSummary)(row),
            transfers_count: transfers.length,
            utilizations_count: utilizations.length,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            mongo_ledger_count: Array.isArray(row.ledger) ? row.ledger.length : 0,
            blockchain_history
        };
    }));
    return { applications, count: applications.length };
};
exports.getAllApplicationsHistoryListService = getAllApplicationsHistoryListService;
const getTdrFullByApplicationAndSamagraService = async (application_id, samagra_id) => {
    const doc = await tdr_1.default.findOne({ application_id, 'owner.samagra_id': samagra_id }).lean();
    if (!doc) {
        const err = new Error('TDR not found for application_id and samagra_id');
        err.statusCode = 404;
        throw err;
    }
    const raw = doc;
    const transferTdrValue = Array.isArray(raw.transfers)
        ? raw.transfers.reduce((sum, t) => sum + Number(t?.trn_value_tdr ?? 0), 0)
        : 0;
    const utilizedTdrValue = Array.isArray(raw.utilizations)
        ? raw.utilizations.reduce((sum, u) => sum + Number(u?.utilized_value_tdr ?? 0), 0)
        : 0;
    const totalTdrValue = Number(raw.total_tdr_value ?? raw.land?.value_tdr ?? 0);
    const storedRemainingTdrValue = Number(raw.remaining_tdr_value);
    const hasStoredRemaining = Number.isFinite(storedRemainingTdrValue);
    const remainingTdrValue = hasStoredRemaining
        ? storedRemainingTdrValue
        : Math.max(0, totalTdrValue - transferTdrValue - utilizedTdrValue);
    const derivedTransferFromBalances = Math.max(0, totalTdrValue - utilizedTdrValue - remainingTdrValue);
    const finalTransferTdrValue = transferTdrValue > 0 ? transferTdrValue : derivedTransferFromBalances;
    const areaTdrSummary = (0, helpers_1.buildAreaTdrSummary)(raw);
    const { total_tdr_value: _tt, remaining_tdr_value: _rt, utilized_tdr_value: _ut, ...areaOnlySummary } = areaTdrSummary;
    return {
        ...raw,
        total_tdr_value: totalTdrValue,
        transfer_tdr_value: finalTransferTdrValue,
        utilized_tdr_value: utilizedTdrValue,
        remaining_tdr_value: remainingTdrValue,
        ...areaOnlySummary
    };
};
exports.getTdrFullByApplicationAndSamagraService = getTdrFullByApplicationAndSamagraService;
const getDrcDetailsByIdService = async (drc_id) => {
    const doc = await tdr_1.default.findOne({ 'project.drc_id': drc_id }).lean();
    if (!doc) {
        const err = new Error('DRC not found for drc_id');
        err.statusCode = 404;
        throw err;
    }
    const raw = doc;
    const transferTdrValue = Array.isArray(raw.transfers)
        ? raw.transfers.reduce((sum, t) => sum + Number(t?.transferred_tdr_value ?? t?.trn_value_tdr ?? 0), 0)
        : 0;
    const transferredArea = Array.isArray(raw.transfers)
        ? raw.transfers.reduce((sum, t) => sum + Number(t?.transferred_area ?? 0), 0)
        : 0;
    const utilizedArea = Array.isArray(raw.utilizations)
        ? raw.utilizations.reduce((sum, u) => sum + Number(u?.utilized_area ?? 0), 0)
        : Number(raw?.utilized_area ?? 0);
    const totalArea = Number(raw?.original_total_area ?? raw?.land?.original_total_area ?? raw?.land?.total_area ?? 0);
    const remainingArea = Number(raw?.remaining_area ?? raw?.land?.proposed_area ?? raw?.land?.total_area ?? 0);
    return {
        ...raw,
        plots: Array.isArray(raw.plots) ? raw.plots : [],
        transfer_tdr_value: transferTdrValue,
        remaining_area: remainingArea,
        utilized_area: utilizedArea,
        transferred_area: transferredArea,
        issued_land_area_sqm: totalArea > 0 ? totalArea : undefined
    };
};
exports.getDrcDetailsByIdService = getDrcDetailsByIdService;
const getAllDrcInfoByRidService = async (rid) => {
    const rows = await tdr_1.default.find({ rid }, {
        application_id: 1,
        tdrApplicationId: 1,
        rid: 1,
        source_application_id: 1,
        owner: 1,
        project: 1,
        land: 1,
        documents: 1,
        total_tdr_value: 1,
        utilized_tdr_value: 1,
        remaining_tdr_value: 1,
        updatedAt: 1
    })
        .sort({ updatedAt: -1 })
        .lean();
    return rows.map((row) => ({
        application_id: row.application_id,
        tdrApplicationId: row.tdrApplicationId,
        rid: row.rid,
        source_application_id: row.source_application_id,
        samagra_id: row.owner?.samagra_id,
        owner_name: row.owner?.name,
        status: row.project?.status,
        total_tdr_value: row.total_tdr_value ?? row.land?.value_tdr,
        utilized_tdr_value: row.utilized_tdr_value,
        remaining_tdr_value: row.remaining_tdr_value,
        drc_id: row.project?.drc_id,
        drc_certificate_no: row.project?.drc_certificate_no,
        drc_generation_dt: row.project?.drc_generation_dt,
        drc_certificate: row.documents?.drc_certificate,
        project: row.project,
        updatedAt: row.updatedAt
    }));
};
exports.getAllDrcInfoByRidService = getAllDrcInfoByRidService;
const getAllHistoryByRidService = async (rid) => {
    const rows = await tdr_1.default.find({ rid }).sort({ updatedAt: -1 }).lean();
    const applications = await Promise.all(rows.map(async (row) => {
        const transfers = Array.isArray(row.transfers) ? row.transfers : [];
        const utilizations = Array.isArray(row.utilizations) ? row.utilizations : [];
        const ledger = Array.isArray(row.ledger) ? row.ledger : [];
        const history = await (0, blockchainService_1.fetchAssetHistory)(row.application_id);
        return {
            application_id: row.application_id,
            tdrApplicationId: row.tdrApplicationId,
            samagra_id: row.owner?.samagra_id,
            owner_name: row.owner?.name,
            source_application_id: row.source_application_id,
            transferred_from_owner: row.transferred_from_owner,
            transfer_txId: row.transfer_txId,
            status: row.project?.status,
            ...(0, helpers_1.buildAreaTdrSummary)(row),
            mongo_ledger_count: ledger.length,
            mongo_ledger: ledger,
            transfers,
            utilizations,
            history
        };
    }));
    return { rid, count: applications.length, applications };
};
exports.getAllHistoryByRidService = getAllHistoryByRidService;
const getBlockchainHistoryForApplicationService = async (application_id) => {
    const [history, doc] = await Promise.all([(0, blockchainService_1.fetchAssetHistory)(application_id), tdr_1.default.findOne({ application_id }).lean()]);
    const summary = (0, helpers_1.buildAreaTdrSummary)(doc ?? {});
    return { history, summary };
};
exports.getBlockchainHistoryForApplicationService = getBlockchainHistoryForApplicationService;
const getAllDrcCertificatesService = async () => {
    const rows = await tdr_1.default.find({
        $or: [
            { 'project.drc_certificate_no': { $exists: true, $nin: [null, ''] } },
            { 'project.drc_id': { $exists: true, $nin: [null, ''] } },
            { 'documents.drc_certificate.hash': { $exists: true, $nin: [null, ''] } }
        ]
    }, {
        application_id: 1,
        tdrApplicationId: 1,
        rid: 1,
        owner: 1,
        project: 1,
        documents: 1,
        remaining_tdr_value: 1,
        remaining_area: 1,
        land: 1,
        updatedAt: 1
    })
        .sort({ updatedAt: -1 })
        .lean();
    return rows.map((row) => ({
        application_id: row.application_id,
        tdrApplicationId: row.tdrApplicationId,
        rid: row.rid,
        samagra_id: row.owner?.samagra_id,
        owner_name: row.owner?.name,
        drc_id: row.project?.drc_id,
        drc_certificate_no: row.project?.drc_certificate_no,
        drc_generation_dt: row.project?.drc_generation_dt,
        drc_date: row.project?.drc_generation_dt ?? row.updatedAt,
        status: row.project?.status,
        drc_status: row.project?.status,
        total_area: row.land?.original_total_area ?? row.land?.total_area,
        proposed_area: row.land?.proposed_area,
        remaining_area: row.remaining_area,
        remaining_tdr_value: row.remaining_tdr_value,
        drc_certificate: row.documents?.drc_certificate,
        updatedAt: row.updatedAt
    }));
};
exports.getAllDrcCertificatesService = getAllDrcCertificatesService;
//# sourceMappingURL=queries.js.map