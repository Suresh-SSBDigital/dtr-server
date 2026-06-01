import type { NextFunction, Request, Response } from 'express';
import { validationApiError } from '../utils/apiError';
import {
  getAllDrcCertificatesService,
  getPaginatedDrcCertificatesService,
  getAllDrcInfoByRidService,
  getAllHistoryByRidService,
  getAllTransfersService,
  getAllUtilizationsService,
  getAllApplicationsHistoryListService,
  getBlockchainHistoryForApplicationService,
  getDrcDetailsByIdService,
  getTdrFullByApplicationAndSamagraService
} from '../services/tdrService';

const toAsiaKolkataIso = (value: unknown): string => {
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

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const yyyy = get('year');
  const mm = get('month');
  const dd = get('day');
  const HH = get('hour');
  const MM = get('minute');
  const SS = get('second');

  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}.000+05:30`;
};

import { tdrFullQuerySchema } from '../validators/tdrValidator';

/**
 * GET /api/tdr/history/applications — list all applications with blockchain history per app.
 */
export const getApplicationsHistoryList = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applications, count } = await getAllApplicationsHistoryListService();

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
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tdr/:application_id/full?samagra_id=... — full TDR document from Mongo (all stored fields).
 */
export const getTdrFullByKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = tdrFullQuerySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      next(validationApiError(error));
      return;
    }

    const application_id = req.params.application_id;
    const tdr = await getTdrFullByApplicationAndSamagraService(application_id, value.samagra_id);
    const total_tdr_value = Number((tdr as any)?.total_tdr_value ?? 0);
    const transfer_tdr_value = Number((tdr as any)?.transfer_tdr_value ?? 0);
    const utilized_tdr_value = Number((tdr as any)?.utilized_tdr_value ?? 0);
    const remaining_tdr_value = Number((tdr as any)?.remaining_tdr_value ?? 0);

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
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tdr/:application_id/blockchain/history — ledger from smart contract (`getHistory` / getAssetHistory).
 */
export const getBlockchainHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application_id = req.params.application_id;
    const { history, summary } = await getBlockchainHistoryForApplicationService(application_id);
    res.status(200).json({
      success: true,
      application_id,
      chaincode_method: 'getHistory',
      ...summary,
      history
    });
  } catch (err) {
    next(err);
  }
};

export const getAllDrcCertificates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await getAllDrcCertificatesService();
    res.status(200).json({ success: true, count: rows.length, certificates: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tdr/drc-certificates?limit=10&offset=0&sortDir=desc&search=...
 * Paginated + projected DRC certificate list for fast UI.
 */
export const getPaginatedDrcCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);
    const sortDir: 1 | -1 = String(req.query.sortDir ?? 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const { certificates, countTotal } = await getPaginatedDrcCertificatesService({
      limit,
      offset,
      sortDir,
      search: search || undefined,
    });

    res.status(200).json({ success: true, countTotal, certificates });
  } catch (err) {
    next(err);
  }
};
/**
 * GET /api/tdr/drc/:drc_id — DRC details by drc_id (without transfers and utilizations).
 */
export const getDrcDetailsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drc_id = req.params.drc_id;
    const drc = await getDrcDetailsByIdService(drc_id);
    res.status(200).json({ success: true, drc_id, drc });
  } catch (err) {
    next(err);
  }
};

export const getAllTransfers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await getAllTransfersService();
    res.status(200).json({ success: true, count: rows.length, transfers: rows });
  } catch (err) {
    next(err);
  }
};

export const getAllUtilizations = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await getAllUtilizationsService();
    res.status(200).json({ success: true, count: rows.length, utilizations: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tdr/rid/:rid/drc-info — all Mongo applications with this RID + DRC-related fields.
 */
export const getAllDrcInfoByRid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rid = req.params.rid;
    const rows = await getAllDrcInfoByRidService(rid);
    res.status(200).json({ success: true, rid, count: rows.length, drc_records: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tdr/rid/:rid/history — per application sharing this RID: Mongo ledger, transfers, utilizations,
 * area/TDR summary, owner/source linkage, plus chain history (`history`).
 */
export const getAllHistoryByRid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rid = req.params.rid;
    const out = await getAllHistoryByRidService(rid);
    res.status(200).json({ success: true, ...out });
  } catch (err) {
    next(err);
  }
};
