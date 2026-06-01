"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllHistoryByRid = exports.getAllDrcInfoByRid = exports.getAllUtilizations = exports.getAllTransfers = exports.getDrcDetailsById = exports.getPaginatedDrcCertificates = exports.getAllDrcCertificates = exports.getBlockchainHistory = exports.getTdrFullByKeys = exports.getApplicationsHistoryList = void 0;
const apiError_1 = require("../utils/apiError");
const tdrService_1 = require("../services/tdrService");
const toAsiaKolkataIso = (value) => {
    const d = value instanceof Date ? value : new Date(String(value));
    // IST offset string (fixed) to avoid locale drift
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(d);
    const get = (type) => parts.find((p) => p.type === type)?.value ?? '00';
    const yyyy = get('year');
    const mm = get('month');
    const dd = get('day');
    const HH = get('hour');
    const MM = get('minute');
    const SS = get('second');
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}.000+05:30`;
};
const tdrValidator_1 = require("../validators/tdrValidator");
/**
 * GET /api/tdr/history/applications — list all applications with blockchain history per app.
 */
const getApplicationsHistoryList = async (_req, res, next) => {
    try {
        const { applications, count } = await (0, tdrService_1.getAllApplicationsHistoryListService)();
        // Ensure blockchain history timestamps are in Asia/Kolkata (IST)
        // to match UI expectations.
        const applicationsWithIST = applications.map((app) => ({
            ...app,
            blockchain_history: Array.isArray(app.blockchain_history)
                ? app.blockchain_history.map((h) => ({
                    ...h,
                    timestamp: typeof h.timestamp === 'string' ? h.timestamp : String(h.timestamp),
                }))
                : app.blockchain_history,
        }));
        res.status(200).json({ success: true, count, applications: applicationsWithIST });
    }
    catch (err) {
        next(err);
    }
};
exports.getApplicationsHistoryList = getApplicationsHistoryList;
/**
 * GET /api/tdr/:application_id/full?samagra_id=... — full TDR document from Mongo (all stored fields).
 */
const getTdrFullByKeys = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.tdrFullQuerySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const application_id = req.params.application_id;
        const tdr = await (0, tdrService_1.getTdrFullByApplicationAndSamagraService)(application_id, value.samagra_id);
        const total_tdr_value = Number(tdr?.total_tdr_value ?? 0);
        const transfer_tdr_value = Number(tdr?.transfer_tdr_value ?? 0);
        const utilized_tdr_value = Number(tdr?.utilized_tdr_value ?? 0);
        const remaining_tdr_value = Number(tdr?.remaining_tdr_value ?? 0);
        res.status(200).json({
            success: true,
            application_id,
            samagra_id: value.samagra_id,
            total_tdr_value,
            transfer_tdr_value,
            utilized_tdr_value,
            remaining_tdr_value,
            tdr
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getTdrFullByKeys = getTdrFullByKeys;
/**
 * GET /api/tdr/:application_id/blockchain/history — ledger from smart contract (`getHistory` / getAssetHistory).
 */
const getBlockchainHistory = async (req, res, next) => {
    try {
        const application_id = req.params.application_id;
        const { history, summary } = await (0, tdrService_1.getBlockchainHistoryForApplicationService)(application_id);
        res.status(200).json({
            success: true,
            application_id,
            chaincode_method: 'getHistory',
            ...summary,
            history
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getBlockchainHistory = getBlockchainHistory;
const getAllDrcCertificates = async (_req, res, next) => {
    try {
        const rows = await (0, tdrService_1.getAllDrcCertificatesService)();
        res.status(200).json({ success: true, count: rows.length, certificates: rows });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllDrcCertificates = getAllDrcCertificates;
/**
 * GET /api/tdr/drc-certificates?limit=10&offset=0&sortDir=desc&search=...
 * Paginated + projected DRC certificate list for fast UI.
 */
const getPaginatedDrcCertificates = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);
        const offset = Math.max(Number(req.query.offset ?? 0), 0);
        const sortDir = String(req.query.sortDir ?? 'desc').toLowerCase() === 'asc' ? 1 : -1;
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const { certificates, countTotal } = await (0, tdrService_1.getPaginatedDrcCertificatesService)({
            limit,
            offset,
            sortDir,
            search: search || undefined,
        });
        res.status(200).json({ success: true, countTotal, certificates });
    }
    catch (err) {
        next(err);
    }
};
exports.getPaginatedDrcCertificates = getPaginatedDrcCertificates;
/**
 * GET /api/tdr/drc/:drc_id — DRC details by drc_id (without transfers and utilizations).
 */
const getDrcDetailsById = async (req, res, next) => {
    try {
        const drc_id = req.params.drc_id;
        const drc = await (0, tdrService_1.getDrcDetailsByIdService)(drc_id);
        res.status(200).json({ success: true, drc_id, drc });
    }
    catch (err) {
        next(err);
    }
};
exports.getDrcDetailsById = getDrcDetailsById;
const getAllTransfers = async (_req, res, next) => {
    try {
        const rows = await (0, tdrService_1.getAllTransfersService)();
        res.status(200).json({ success: true, count: rows.length, transfers: rows });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllTransfers = getAllTransfers;
const getAllUtilizations = async (_req, res, next) => {
    try {
        const rows = await (0, tdrService_1.getAllUtilizationsService)();
        res.status(200).json({ success: true, count: rows.length, utilizations: rows });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllUtilizations = getAllUtilizations;
/**
 * GET /api/tdr/rid/:rid/drc-info — all Mongo applications with this RID + DRC-related fields.
 */
const getAllDrcInfoByRid = async (req, res, next) => {
    try {
        const rid = req.params.rid;
        const rows = await (0, tdrService_1.getAllDrcInfoByRidService)(rid);
        res.status(200).json({ success: true, rid, count: rows.length, drc_records: rows });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllDrcInfoByRid = getAllDrcInfoByRid;
/**
 * GET /api/tdr/rid/:rid/history — per application sharing this RID: Mongo ledger, transfers, utilizations,
 * area/TDR summary, owner/source linkage, plus chain history (`history`).
 */
const getAllHistoryByRid = async (req, res, next) => {
    try {
        const rid = req.params.rid;
        const out = await (0, tdrService_1.getAllHistoryByRidService)(rid);
        res.status(200).json({ success: true, ...out });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllHistoryByRid = getAllHistoryByRid;
//# sourceMappingURL=tdrHistoryController.js.map