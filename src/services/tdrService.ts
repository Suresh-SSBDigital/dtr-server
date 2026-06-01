import crypto from 'crypto';
import TDR from '../models/tdr';
import { fetchAssetHistory, pushCreateAsset, pushUpdateAsset } from './blockchainService';
import { generateDataHash } from './hashService';
import { buildLedgerEntry as buildLifecycleLedgerEntry } from './ledgerService';

export interface CreateTdrPayload {
  tdrApplicationId: string;
  rid: string;
  owner: Record<string, unknown>;
  project: Record<string, unknown>;
  land: Record<string, unknown>;
  plots?: Array<Record<string, unknown>>;
  documents?: Record<string, unknown>;
}

export interface UpdateDrcPayload {
  application_id: string;
  samagra_id: string;
  drc_id: string;
  drc_certificate_no: string;
  drc_generation_dt: Date;
  form4: string;
  drc_certificate: string;
}

export interface InsertTransferPayload {
  application_id: string;
  samagra_id: string;
  trn_id: string;
  owner_from: string;
  owner_to?: string;
  trn_value_tdr?: number;
  transferred_area: number;
  trn_date: Date;
  status: string;
  transferee_owner: {
    owner_id?: string;
    owner_name?: string;
    name?: string;
    samagra_id: string;
    mobile?: string;
    email?: string;
    address?: string;
    owner_type?: string;
    gender?: string;
    owner_gender?: string;
    dob?: string;
  };
}

export interface InsertTransferRequestResult {
  application_id: string;
  txId: string;
  hash: string;
  old_total_area: number;
old_total_tdr: number;
  remaining_value_tdr: number;
  old_owner_remaining_tdr: number;
  old_owner_remaining_area: number;
  transferred_tdr_value: number;
  transferred_area: number;
  collector_guideline_rate: number;
  multiplier_factor: number;
  generated_tdr_value: number;
  recipient_application_id: string;
  recipient_tdrApplicationId: string;
  recipient_rid: string;
  new_owner_application_id: string;
  new_owner_tdrApplicationId: string;
  new_owner_rid: string;
  recipient_asset_txId: string;
  recipient_asset_hash: string;
  source_application_id: string;
  source_rid: string;
  transferred_from_owner: string;
  transfer_txId: string;
}

export interface InsertUtilizationPayload {
  application_id: string;
  samagra_id: string;
  utilization_id: string;
  drc_id: string;
  drc_certificate_no: string;
  utilized_by: string;
  utilized_value_tdr?: number;
  utilized_area: number;
  utilization_purpose: string;
  utilization_date: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  remarks?: string;
}

export interface NewDrcOfOwnerPayload {
  querytype: string;
  application_id: string;
  owner_id: string;
  samagra_id: string;
  drc_certificate_doc_name: string;
  drc_certificate_doc_path: string;
  drc_receipt_no: string;
  drc_file_no: string;
  isSigned: string;
  is_digital_sign: string;
  tdr_value: string;
  collector_guideline_rate: number;
  multiplier_factor: number;
  drc_id: string;
  drc_certificate_no: string;
  drc_generation_dt?: Date | string;
}

export interface InsertObjectionSuggestionPayload {
  applicationid: string;
  objectionSuggestionRemark: string;
  objectionSuggestionLand: Array<{
    land_id: number;
    obj_sugg: string;
    obj_sugg_remark: string;
    obj_sugg_doc_name: string;
    obj_sugg_doc_path: string;
    hearing_remark: string;
    hearing_doc_name: string;
    hearing_doc_path: string;
  }>;
  objectionSuggestionPlot: Array<{
    plot_id: number;
    obj_sugg_p: string;
    obj_sugg_remark_p: string;
    obj_sugg_doc_name_p: string;
    obj_sugg_doc_path_p: string;
    hearing_remark_p: string;
    hearing_doc_name_p: string;
    hearing_doc_path_p: string;
  }>;
  p_rid: number;
  p_updatedbyuserid: number;
  p_updatedby_ipaddress: string;
  p_updatedby_remarks: string;
  p_updatedbyroleid: number;
  p_updatedbystatus: number;
  p_transferto: number;
  p_submit_status: string;
}

export interface UpdateOwnerReadyForDrcPayload {
  application_id: string;
  samagra_id: string;
  performed_by: string;
  remarks?: string;
}

export const getTdrHistoryService = async (
  application_id: string
): Promise<{
  application_id: string;
  tdr: unknown;
  history: Array<{ txId: string; timestamp: string; value: unknown; isDelete: boolean }>;
}> => {
  const tdr = await TDR.findOne({ application_id });
  if (!tdr) {
    const err = new Error('TDR record not found for application_id') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  return {
    application_id,
    tdr,
    history: await fetchAssetHistory(application_id)
  };
};

export const getAllApplicationsService = async (): Promise<
  Array<{
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    owner_name?: string;
    district?: string;
    status?: string;
    total_tdr_value?: number;
    utilized_tdr_value?: number;
    remaining_tdr_value?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }>
> => {
  const rows = await TDR.find(
    {},
    {
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
    }
  )
    .sort({ createdAt: -1 })
    .lean();

  return rows.map((row: any) => ({
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

export interface ApplicationHistoryListItem {
  application_id: string;
  tdrApplicationId?: string;
  rid: string;
  samagra_id?: string;
  owner_name?: string;
  source_application_id?: string;
  district?: string;
  status?: string;
  total_tdr_value?: number;
  utilized_tdr_value?: number;
  remaining_tdr_value?: number;
  total_area?: number;
  proposed_area?: number;
  remaining_area?: number;
  utilized_area?: number;
  transferred_area?: number;
  transferred_tdr_value?: number;
  transfers_count?: number;
  utilizations_count?: number;
  createdAt?: Date;
  updatedAt?: Date;
  mongo_ledger_count: number;
  blockchain_history: Array<{ txId: string; timestamp: string; value: unknown; isDelete: boolean }>;
}

/** Every application row from Mongo plus in-process chain history (Fabric: query `getHistory`). */
/**
 * Wraps a promise with a timeout. If the promise does not resolve within `ms`
 * milliseconds it resolves with `fallback` instead of blocking indefinitely.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/** Lean projection: only the fields needed by the applications list. */
const APPLICATIONS_LIST_PROJECTION = {
  application_id: 1,
  tdrApplicationId: 1,
  rid: 1,
  source_application_id: 1,
  owner: 1,
  project: 1,
  land: 1,
  total_tdr_value: 1,
  utilized_tdr_value: 1,
  remaining_tdr_value: 1,
  remaining_area: 1,
  transfers: 1,
  utilizations: 1,
  ledger: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

export const getAllApplicationsHistoryListService = async (): Promise<{
  applications: ApplicationHistoryListItem[];
  count: number;
}> => {
  // Use a lean projection to avoid pulling huge fields (documents, plots, etc.)
  const rows = await TDR.find({}, APPLICATIONS_LIST_PROJECTION).sort({ createdAt: -1 }).lean();

  const applications: ApplicationHistoryListItem[] = await Promise.all(
    (rows as any[]).map(async (row) => {
      // Each blockchain call is capped at 2 s so one slow node cannot stall the
      // entire list. History is still returned when available within the window.
      const blockchain_history = await withTimeout(
        fetchAssetHistory(row.application_id),
        2000,
        [],
      );
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
        ...buildAreaTdrSummary(row),
        transfers_count: transfers.length,
        utilizations_count: utilizations.length,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        mongo_ledger_count: Array.isArray(row.ledger) ? row.ledger.length : 0,
        blockchain_history,
      };
    })
  );
  return { applications, count: applications.length };
};

/** Full MongoDB TDR document (all fields) for application_id + owner.samagra_id. */
export const getTdrFullByApplicationAndSamagraService = async (
  application_id: string,
  samagra_id: string
): Promise<Record<string, unknown>> => {
  const doc = await TDR.findOne({ application_id, 'owner.samagra_id': samagra_id }).lean();
  if (!doc) {
    const err = new Error('TDR not found for application_id and samagra_id') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }
  const raw = doc as any;
  const transferTdrValue = Array.isArray(raw.transfers)
    ? raw.transfers.reduce((sum: number, t: any) => sum + Number(t?.trn_value_tdr ?? 0), 0)
    : 0;
  const utilizedTdrValue = Array.isArray(raw.utilizations)
    ? raw.utilizations.reduce((sum: number, u: any) => sum + Number(u?.utilized_value_tdr ?? 0), 0)
    : 0;
  const totalTdrValue = Number(raw.total_tdr_value ?? raw.land?.value_tdr ?? 0);
  const storedRemainingTdrValue = Number(raw.remaining_tdr_value);
  const hasStoredRemaining = Number.isFinite(storedRemainingTdrValue);
  const remainingTdrValue = hasStoredRemaining
    ? storedRemainingTdrValue
    : Math.max(0, totalTdrValue - transferTdrValue - utilizedTdrValue);
  const derivedTransferFromBalances = Math.max(0, totalTdrValue - utilizedTdrValue - remainingTdrValue);
  const finalTransferTdrValue = transferTdrValue > 0 ? transferTdrValue : derivedTransferFromBalances;
  const areaTdrSummary = buildAreaTdrSummary(raw);
  const { total_tdr_value: _tt, remaining_tdr_value: _rt, utilized_tdr_value: _ut, ...areaOnlySummary } = areaTdrSummary;

  return {
    ...raw,
    total_tdr_value: totalTdrValue,
    transfer_tdr_value: finalTransferTdrValue,
    utilized_tdr_value: utilizedTdrValue,
    remaining_tdr_value: remainingTdrValue,
    ...areaOnlySummary
  } as Record<string, unknown>;
};

/** Full DRC view by drc_id (excluding transfers and utilizations arrays). */
export const getDrcDetailsByIdService = async (
  drc_id: string
): Promise<Record<string, unknown>> => {

  const doc = await TDR.findOne(
    { 'project.drc_id': drc_id }
  ).lean();

  if (!doc) {
    const err = new Error('DRC not found for drc_id') as Error & {
      statusCode?: number;
    };

    err.statusCode = 404;
    throw err;
  }

  const raw = doc as any;

  const transferTdrValue = Array.isArray(raw.transfers)
    ? raw.transfers.reduce(
        (sum: number, t: any) =>
          sum + Number(t?.transferred_tdr_value ?? t?.trn_value_tdr ?? 0),
        0
      )
    : 0;

  const transferredArea = Array.isArray(raw.transfers)
    ? raw.transfers.reduce(
        (sum: number, t: any) =>
          sum + Number(t?.transferred_area ?? 0),
        0
      )
    : 0;

  const utilizedArea = Array.isArray(raw.utilizations)
    ? raw.utilizations.reduce(
        (sum: number, u: any) =>
          sum + Number(u?.utilized_area ?? 0),
        0
      )
    : Number(raw?.utilized_area ?? 0);

  const totalArea = Number(
    raw?.original_total_area ??
    raw?.land?.original_total_area ??
    raw?.land?.total_area ??
    0
  );

  const remainingArea = Number(
    raw?.remaining_area ??
    raw?.land?.proposed_area ??
    raw?.land?.total_area ??
    0
  );

  return {
    ...raw,

    plots: Array.isArray(raw.plots)
      ? raw.plots
      : [],

    transfer_tdr_value: transferTdrValue,

    remaining_area: remainingArea,

    utilized_area: utilizedArea,

    transferred_area: transferredArea,

    /** Issued / registry land area (sq.m) — explicit for UI when `land.total_area` is missing or string-only in JSON. */
    issued_land_area_sqm: totalArea > 0 ? totalArea : undefined,
  } as Record<string, unknown>;
};
/** All Mongo rows with this RID — DRC-focused projection (multiple rows after transfer share RID). */
export const getAllDrcInfoByRidService = async (
  rid: string
): Promise<
  Array<{
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    source_application_id?: string;
    samagra_id?: string;
    owner_name?: string;
    status?: string;
    total_tdr_value?: number;
    utilized_tdr_value?: number;
    remaining_tdr_value?: number;
    drc_id?: string;
    drc_certificate_no?: string;
    drc_generation_dt?: Date;
    drc_certificate?: unknown;
    project?: unknown;
    updatedAt?: Date;
  }>
> => {
  const rows = await TDR.find(
    { rid },
    {
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
    }
  )
    .sort({ updatedAt: -1 })
    .lean();

  return (rows as any[]).map((row) => ({
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

/** Mongo + chain history for every application that shares this RID (transfer source/recipient, etc.). */
export const getAllHistoryByRidService = async (
  rid: string
): Promise<{
  rid: string;
  count: number;
  applications: Array<{
    application_id: string;
    tdrApplicationId?: string;
    samagra_id?: string;
    owner_name?: string;
    source_application_id?: string;
    transferred_from_owner?: string;
    transfer_txId?: string;
    status?: string;
    total_area?: number;
    remaining_area?: number;
    utilized_area?: number;
    transferred_area?: number;
    total_tdr_value?: number;
    remaining_tdr_value?: number;
    utilized_tdr_value?: number;
    transferred_tdr_value?: number;
    mongo_ledger_count: number;
    mongo_ledger: unknown[];
    transfers: unknown[];
    utilizations: unknown[];
    history: Array<{ txId: string; timestamp: string; value: unknown; isDelete: boolean }>;
  }>;
}> => {
  const rows = await TDR.find({ rid }).sort({ updatedAt: -1 }).lean();
  const applications = await Promise.all(
    (rows as any[]).map(async (row) => {
      const transfers = Array.isArray(row.transfers) ? row.transfers : [];
      const utilizations = Array.isArray(row.utilizations) ? row.utilizations : [];
      const ledger = Array.isArray(row.ledger) ? row.ledger : [];
      const history = await fetchAssetHistory(row.application_id);
      return {
        application_id: row.application_id,
        tdrApplicationId: row.tdrApplicationId,
        samagra_id: row.owner?.samagra_id,
        owner_name: row.owner?.name,
        source_application_id: row.source_application_id,
        transferred_from_owner: row.transferred_from_owner,
        transfer_txId: row.transfer_txId,
        status: row.project?.status,
        ...buildAreaTdrSummary(row),
        mongo_ledger_count: ledger.length,
        mongo_ledger: ledger,
        transfers,
        utilizations,
        history
      };
    })
  );
  return { rid, count: applications.length, applications };
};

/** Blockchain-only history for one application (no Mongo read). */
export const getBlockchainHistoryForApplicationService = async (
  application_id: string
): Promise<{
  history: Array<{ txId: string; timestamp: string; value: unknown; isDelete: boolean }>;
  summary: Record<string, number>;
}> => {
  const [history, doc] = await Promise.all([fetchAssetHistory(application_id), TDR.findOne({ application_id }).lean()]);
  const summary = buildAreaTdrSummary(doc ?? {});
  return { history, summary };
};

export const getAllDrcCertificatesService = async (): Promise<
  Array<{
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    samagra_id?: string;
    owner_name?: string;
    drc_id?: string;
    drc_certificate_no?: string;
    drc_generation_dt?: Date;
    drc_date?: Date;
    status?: string;
    drc_status?: string;
    drc_certificate?: unknown;
    updatedAt?: Date;
  }>
> => {
  const rows = await TDR.find(
    {
      $or: [
        { 'project.drc_certificate_no': { $exists: true, $nin: [null, ''] } },
        { 'project.drc_id': { $exists: true, $nin: [null, ''] } },
        { 'documents.drc_certificate': { $exists: true, $ne: null } }
      ]
    },
 {
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
}
  )
    .sort({ updatedAt: -1 })
    .lean();

  return rows.map((row: any) => ({
  application_id: row.application_id,

  tdrApplicationId: row.tdrApplicationId,

  rid: row.rid,

  samagra_id: row.owner?.samagra_id,

  owner_name: row.owner?.name,

  drc_id: row.project?.drc_id,

  drc_certificate_no:
    row.project?.drc_certificate_no,

  drc_generation_dt:
    row.project?.drc_generation_dt,

  drc_date:
    row.project?.drc_generation_dt ??
    row.updatedAt,

  status:
    row.project?.status,

  drc_status:
    row.project?.status,

  // ADD THESE ↓↓↓

  total_area:
    row.land?.original_total_area ??
    row.land?.total_area,

  proposed_area:
    row.land?.proposed_area,

  remaining_area:
    row.remaining_area,

  remaining_tdr_value:
    row.remaining_tdr_value,

  drc_certificate:
    row.documents?.drc_certificate,

  updatedAt:
    row.updatedAt
}));
};

/** Shared filter — only documents that actually have a DRC issued. */
const DRC_FILTER = {
  $or: [
    { 'project.drc_certificate_no': { $exists: true, $nin: [null, ''] } },
    { 'project.drc_id': { $exists: true, $nin: [null, ''] } },
    { 'documents.drc_certificate': { $exists: true, $ne: null } },
  ],
} as const;

/** Minimal projection for certificate list rows. */
const DRC_LIST_PROJECTION = {
  application_id: 1,
  tdrApplicationId: 1,
  rid: 1,
  owner: 1,
  project: 1,
  documents: 1,
  remaining_tdr_value: 1,
  remaining_area: 1,
  land: 1,
  updatedAt: 1,
} as const;

function mapDrcRow(row: any) {
  return {
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
    updatedAt: row.updatedAt,
  };
}

/**
 * Paginated DRC certificate list with DB-level skip/limit so the full
 * collection is never loaded into memory for a single page fetch.
 */
export const getPaginatedDrcCertificatesService = async (opts: {
  limit: number;
  offset: number;
  sortDir: 1 | -1;
  search?: string;
}): Promise<{ certificates: ReturnType<typeof mapDrcRow>[]; countTotal: number }> => {
  const { limit, offset, sortDir, search } = opts;

  // Build the base filter (has DRC) optionally narrowed by search term.
  let filter: Record<string, unknown> = { ...DRC_FILTER };
  if (search) {
    filter = {
      ...filter,
      $and: [
        DRC_FILTER,
        {
          $or: [
            { 'project.drc_certificate_no': { $regex: search, $options: 'i' } },
            { 'project.drc_id': { $regex: search, $options: 'i' } },
            { 'owner.name': { $regex: search, $options: 'i' } },
          ],
        },
      ],
    };
  }

  // countDocuments uses indexes and is very fast for the DRC filter.
  const [countTotal, rows] = await Promise.all([
    TDR.countDocuments(filter),
    TDR.find(filter, DRC_LIST_PROJECTION)
      .sort({ updatedAt: sortDir })
      .skip(offset)
      .limit(limit)
      .lean(),
  ]);

  return { certificates: (rows as any[]).map(mapDrcRow), countTotal };
};

export const getAllTransfersService = async (): Promise<
  Array<{
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    samagra_id?: string;
    owner_name?: string;
    source_application_id?: string;
    transfer: unknown;
    total_area?: number;
    remaining_area?: number;
    utilized_area?: number;
    transferred_area?: number;
    total_tdr_value?: number;
    remaining_tdr_value?: number;
    utilized_tdr_value?: number;
    transferred_tdr_value?: number;
  }>
> => {
  const rows = await TDR.find(
    { transfers: { $exists: true, $ne: [] } },
    {
      application_id: 1,
      tdrApplicationId: 1,
      rid: 1,
      transfers: 1,
      utilizations: 1,
      land: 1,
      project: 1,
      total_tdr_value: 1,
      remaining_tdr_value: 1,
      utilized_tdr_value: 1,
      owner: 1,
      source_application_id: 1,
      updatedAt: 1
    }
  )
    .sort({ updatedAt: -1 })
    .lean();

  const out: Array<{
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    samagra_id?: string;
    owner_name?: string;
    source_application_id?: string;
    transfer: unknown;
    total_area?: number;
    remaining_area?: number;
    utilized_area?: number;
    transferred_area?: number;
    total_tdr_value?: number;
    remaining_tdr_value?: number;
    utilized_tdr_value?: number;
    transferred_tdr_value?: number;
  }> = [];
  for (const row of rows as any[]) {
    const transfers = Array.isArray(row.transfers) ? row.transfers : [];
    const summary = buildAreaTdrSummary(row);
    for (const transfer of transfers) {
      out.push({
        application_id: row.application_id,
        tdrApplicationId: row.tdrApplicationId,
        rid: row.rid,
        samagra_id: row.owner?.samagra_id,
        owner_name: row.owner?.name,
        source_application_id: row.source_application_id,
        transfer,
        ...summary
      });
    }
  }
  return out;
};

export const getAllUtilizationsService = async (): Promise<
  Array<{
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    samagra_id?: string;
    owner_name?: string;
    source_application_id?: string;
    utilization: unknown;
    total_area?: number;
    remaining_area?: number;
    utilized_area?: number;
    transferred_area?: number;
    total_tdr_value?: number;
    remaining_tdr_value?: number;
    utilized_tdr_value?: number;
    transferred_tdr_value?: number;
  }>
> => {
  const rows = await TDR.find(
    { utilizations: { $exists: true, $ne: [] } },
    {
      application_id: 1,
      tdrApplicationId: 1,
      rid: 1,
      transfers: 1,
      utilizations: 1,
      land: 1,
      project: 1,
      total_tdr_value: 1,
      remaining_tdr_value: 1,
      utilized_tdr_value: 1,
      owner: 1,
      source_application_id: 1,
      updatedAt: 1
    }
  )
    .sort({ updatedAt: -1 })
    .lean();

  const out: Array<{
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    samagra_id?: string;
    owner_name?: string;
    source_application_id?: string;
    utilization: unknown;
    total_area?: number;
    remaining_area?: number;
    utilized_area?: number;
    transferred_area?: number;
    total_tdr_value?: number;
    remaining_tdr_value?: number;
    utilized_tdr_value?: number;
    transferred_tdr_value?: number;
  }> = [];
  for (const row of rows as any[]) {
    const utilizations = Array.isArray(row.utilizations) ? row.utilizations : [];
    const summary = buildAreaTdrSummary(row);
    for (const utilization of utilizations) {
      out.push({
        application_id: row.application_id,
        tdrApplicationId: row.tdrApplicationId,
        rid: row.rid,
        samagra_id: row.owner?.samagra_id,
        owner_name: row.owner?.name,
        source_application_id: row.source_application_id,
        utilization,
        ...summary
      });
    }
  }
  return out;
};

function generateApplicationId(): string {
  return `TDR-${Date.now()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

function generateImportantDataHash(payload: CreateTdrPayload): string {
  const hashInput = {
    rid: payload.rid,
    owner: payload.owner,
    project: payload.project,
    land: payload.land
  };

  return crypto.createHash('sha256').update(JSON.stringify(hashInput)).digest('hex');
}

export const createTdrApplication = async (
  payload: CreateTdrPayload
): Promise<{ application_id: string; tdrApplicationId: string; samagra_id: string; rid: string; txId: string; hash: string }> => {
   const ownerId = String((payload.owner as any)?.owner_id ?? '').trim();

  if (!ownerId) {
    const err = new Error('owner_id is required') as Error & {
      statusCode?: number;
      code?: string;
    };

    err.statusCode = 400;
    err.code = 'OWNER_ID_REQUIRED';

    throw err;
  }

  const existingOwner = await TDR.findOne({
    'owner.owner_id': ownerId
  })
    .select({ application_id: 1 })
    .lean();

  if (existingOwner) {
    const err = new Error('same owner_id already exists') as Error & {
      statusCode?: number;
      code?: string;
    };

    err.statusCode = 409;
    err.code = 'OWNER_ID_ALREADY_EXISTS';

    throw err;
  }
  
  const samagraId = String((payload.owner as any)?.samagra_id ?? '').trim();

if (!samagraId) {
  const err = new Error('samagra_id is required') as Error & {
    statusCode?: number;
    code?: string;
  };

  err.statusCode = 400;
  err.code = 'SAMAGRA_ID_REQUIRED';

  throw err;
}

const existingSamagra = await TDR.findOne({
  'owner.samagra_id': samagraId
})
  .select({ application_id: 1 })
  .lean();

if (existingSamagra) {
  const err = new Error('same samagra_id already exists') as Error & {
    statusCode?: number;
    code?: string;
  };

  err.statusCode = 409;
  err.code = 'SAMAGRA_ID_ALREADY_EXISTS';

  throw err;
}
  const existing = await TDR.findOne({ tdrApplicationId: payload.tdrApplicationId });
  if (existing) {
    const err = new Error('tdrApplicationId already exists') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 409;
    err.code = 'TDR_APPLICATION_ID_ALREADY_EXISTS';
    throw err;
  }

  const rid = String(payload.rid).trim();
  const existingRid = await TDR.findOne({ rid }).select({ _id: 1 }).lean();
  if (existingRid) {
    const err = new Error('rid already exists') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 409;
    err.code = 'RID_ALREADY_EXISTS';
    throw err;
  }

  const application_id = generateApplicationId();

  const totalTdrValue = Number((payload.land as any)?.value_tdr ?? 0);

const totalArea = Number(
 (payload.land as any)?.total_area ?? 0
);

const docToInsert = {
  application_id,
  tdrApplicationId: payload.tdrApplicationId,
  rid,
  owner: payload.owner,

  project: payload.project,

  land: {
    ...payload.land,

    // whole land fixed forever
    original_total_area: totalArea,

    // current usable area
    proposed_area: totalArea
  },

  total_tdr_value: totalTdrValue,

  utilized_tdr_value: 0,

  remaining_tdr_value: totalTdrValue,

  // important
  remaining_area: totalArea,

  utilized_area:0,

  plots: payload.plots ?? [],

  transfers: [],

  utilizations: [],

  documents: payload.documents ?? {}
};

  try {
    await TDR.create(docToInsert);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      const err = new Error('Duplicate application_id, rid, or external mapping') as Error & {
        statusCode?: number;
        code?: string;
      };
      err.statusCode = 409;
      err.code = 'TDR_DUPLICATE_ENTRY';
      throw err;
    }
    throw error;
  }

  const hash = generateImportantDataHash(payload);
  const blockchainResult = await pushCreateAsset({
    application_id,
    tdrApplicationId: payload.tdrApplicationId,
    rid,
    hash
  });

  return {
    application_id,
    tdrApplicationId: payload.tdrApplicationId,
    samagra_id: String((payload.owner as any)?.samagra_id ?? ''),
    rid,
    txId: blockchainResult.txId,
    hash
  };
};

function generateDrcUpdateHash(input: {
  project: unknown;
  documents: unknown;
  drc: Pick<UpdateDrcPayload, 'drc_id' | 'drc_certificate_no' | 'drc_generation_dt'>;
}): string {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export const updateDrcService = async (
  payload: UpdateDrcPayload
): Promise<{ application_id: string; txId: string; hash: string }> => {
  const duplicateDrc = await TDR.findOne({
    $or: [
      { 'project.drc_certificate_no': payload.drc_certificate_no },
      { 'project.drc_certificate_id': payload.drc_id },
      { 'project.drc_id': payload.drc_id }
    ],
    application_id: { $ne: payload.application_id }
  }).lean();

  if (duplicateDrc) {
    const err = new Error('This DRC certificate is already linked with another application.') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 409;
    err.code = 'DUPLICATE_DRC';
    throw err;
  }

  const uploadedAt = new Date();
  const existingTdr = await TDR.findOne({
    application_id: payload.application_id,
    'owner.samagra_id': payload.samagra_id
  });
  if (!existingTdr) {
    const err = new Error('TDR record not found for application_id and samagra_id') as Error & {
      statusCode?: number;
    };
    err.statusCode = 404;
    throw err;
  }
  const rid = String((existingTdr as any).rid);

  const form4Hash = await generateDataHash({
    application_id: payload.application_id,
    rid,
    document_type: 'FORM4',
    file_url: payload.form4,
    uploaded_at: uploadedAt.toISOString()
  });
  const drcHash = await generateDataHash({
    application_id: payload.application_id,
    rid,
    document_type: 'DRC_CERTIFICATE',
    file_url: payload.drc_certificate,
    uploaded_at: uploadedAt.toISOString()
  });

  const updated = await TDR.findOneAndUpdate(
    { application_id: payload.application_id, rid },
    {
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
    },
    { new: true }
  );

  if (!updated) {
    const err = new Error('TDR record not found for application_id and samagra_id') as Error & {
      statusCode?: number;
    };
    err.statusCode = 404;
    throw err;
  }

  const hash = generateDrcUpdateHash({
    project: updated.project,
    documents: updated.documents,
    drc: {
      drc_id: payload.drc_id,
      drc_certificate_no: payload.drc_certificate_no,
      drc_generation_dt: payload.drc_generation_dt
    }
  });

  const blockchainResult = await pushUpdateAsset({
    application_id: payload.application_id,
    rid,
    hash
  });

  return {
    application_id: payload.application_id,
    txId: blockchainResult.txId,
    hash
  };
};

function generateTransferHash(input: {
  application_id: string;
  rid: string;
  land: unknown;
  transfers: unknown;
  valuation: {
    original_tdr_value: number;
    transferred_tdr_value: number;
    generated_tdr_value: number;
    remaining_tdr_value: number;
    transferred_area: number;
    remaining_area: number;
    collector_guideline_rate: number;
    multiplier_factor: number;
  };
  audit?: {
    recipient_application_id: string;
    recipient_rid: string;
    recipient_tdrApplicationId: string;
  };
}): string {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function generateIndependentOwnerAssetHash(input: {
  application_id: string;
  tdrApplicationId: string;
  rid: string;
  owner: unknown;
  project: unknown;
  land: unknown;
  plots: unknown;
  source_application_id: string;
  source_rid: string;
  transferred_from_owner: string;
  transfer_txId: string;
  trn_value_tdr: number;
  transferred_area: number;
  collector_guideline_rate: number;
  multiplier_factor: number;
  generated_tdr_value: number;
}): string {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function deepClonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stripDrcFromProjectForNewOwner(project: Record<string, unknown>): Record<string, unknown> {
  const next = { ...project } as Record<string, unknown>;
  delete next.drc_certificate_no;
  delete next.drc_id;
  delete next.drc_generation_dt;
  next.status = 'CREATED';
  return next;
}

async function generateUniqueIndependentApplicationIds(): Promise<{
  application_id: string;
  tdrApplicationId: string;
  rid: string;
}> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const application_id = generateApplicationId();
    const tdrApplicationId = `TDRAPP-${Date.now()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const rid = `RID-${Date.now()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const clash = await TDR.findOne({
      $or: [{ application_id }, { tdrApplicationId }, { rid }]
    })
      .select({ application_id: 1 })
      .lean();
    if (!clash) {
      return { application_id, tdrApplicationId, rid };
    }
  }
  const err = new Error('Failed to allocate unique application identifiers') as Error & { statusCode?: number };
  err.statusCode = 500;
  throw err;
}

/** New application + external id; RID is reused (e.g. same RID as transfer source for traceability). */
async function generateRecipientAppIdsWithSharedRid(sharedRid: string): Promise<{
  application_id: string;
  tdrApplicationId: string;
  rid: string;
}> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const application_id = generateApplicationId();
    const tdrApplicationId = `TDRAPP-${Date.now()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const clash = await TDR.findOne({
      $or: [{ application_id }, { tdrApplicationId }]
    })
      .select({ application_id: 1 })
      .lean();
    if (!clash) {
      return { application_id, tdrApplicationId, rid: sharedRid };
    }
  }
  const err = new Error('Failed to allocate unique recipient application identifiers') as Error & {
    statusCode?: number;
  };
  err.statusCode = 500;
  throw err;
}

function buildTransfereeOwner(
  priorOwnerSnapshot: Record<string, unknown>,
  payload: InsertTransferPayload
): Record<string, unknown> {
  const partial = (payload.transferee_owner ?? {}) as Record<string, unknown>;
  const resolvedName =
    (partial.owner_name as string) ??
    (partial.name as string) ??
    payload.owner_to ??
    'NEW_OWNER';
  return {
    ...priorOwnerSnapshot,
    ...partial,
    name: resolvedName,
    owner_name: resolvedName,
    owner_id: (partial.owner_id as string) ?? `OWNER-${crypto.randomBytes(5).toString('hex')}`,
    owner_type: (partial.owner_type as string) ?? (priorOwnerSnapshot.owner_type as string) ?? 'INDIVIDUAL',
    owner_gender:
      (partial.owner_gender as string) ??
      (partial.gender as string) ??
      (priorOwnerSnapshot.owner_gender as string),
    gender:
      (partial.gender as string) ??
      (partial.owner_gender as string) ??
      (priorOwnerSnapshot.owner_gender as string),
    samagra_id: payload.transferee_owner.samagra_id,
    mobile: (partial.mobile as string) ?? (priorOwnerSnapshot.mobile as string),
    email: (partial.email as string) ?? (priorOwnerSnapshot.email as string),
    address: (partial.address as string) ?? (priorOwnerSnapshot.address as string),
    dob: (partial.dob as string) ?? (priorOwnerSnapshot.dob as string),
    is_first_owner: false,
    current_balance_tdr: 0
  };
}

async function fetchTdrForOperation(application_id: string, samagra_id: string) {
  const tdr = await TDR.findOne({ application_id, 'owner.samagra_id': samagra_id });
  if (!tdr) return null;

  const externalId = (tdr as any).tdrApplicationId as string | undefined;
  if (!externalId) return tdr;

  // Re-validate via external reference when available.
  return TDR.findOne({ application_id, 'owner.samagra_id': samagra_id, tdrApplicationId: externalId });
}

function hasDrcDocument(documents: any): boolean {
  const drc = documents?.drc_certificate;
  if (!drc) return false;
  if (typeof drc === 'string') return drc.trim().length > 0;
  if (typeof drc === 'object') {
    return typeof drc.file_url === 'string' ? drc.file_url.trim().length > 0 : true;
  }
  return false;
}

function resolveValuationConfig(tdr: any): { collector_guideline_rate: number; multiplier_factor: number } {
  const project = (tdr?.project ?? {}) as Record<string, unknown>;
  const land = (tdr?.land ?? {}) as Record<string, unknown>;
  const collectorGuidelineRate = Number(
    project.collector_guideline_rate ??
      land.collector_guideline_rate ??
      process.env.DEFAULT_COLLECTOR_GUIDELINE_RATE ??
      0
  );
  const multiplierFactor = Number(
    project.multiplier_factor ?? land.multiplier_factor ?? process.env.DEFAULT_MULTIPLIER_FACTOR ?? 1
  );
  if (!Number.isFinite(collectorGuidelineRate) || collectorGuidelineRate <= 0) {
    const err = new Error('Collector guideline rate is missing in project/land/master valuation config') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 400;
    err.code = 'VALUATION_CONFIG_MISSING';
    throw err;
  }
  if (!Number.isFinite(multiplierFactor) || multiplierFactor <= 0) {
    const err = new Error('Multiplier factor is missing in project/land/master valuation config') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 400;
    err.code = 'VALUATION_CONFIG_MISSING';
    throw err;
  }
  return { collector_guideline_rate: collectorGuidelineRate, multiplier_factor: multiplierFactor };
}

// async function ensureDrcNotConsumedForSamagra(params: {
//   application_id: string;
//   samagra_id: string;
//   drc_certificate_no: string;
//   current?: any;
// }): Promise<void> {
//   const drcNo = String(params.drc_certificate_no ?? '').trim();
//   if (!drcNo) return;

//   const duplicateElsewhere = await TDR.findOne({
//     application_id: { $ne: params.application_id },
//     'owner.samagra_id': params.samagra_id,
//     'project.drc_certificate_no': drcNo
//   })
//     .select({ application_id: 1 })
//     .lean();

//   if (duplicateElsewhere) {
//     const err = new Error('same DRC cannot be reused for same Samagra owner') as Error & {
//       statusCode?: number;
//       code?: string;
//     };
//     err.statusCode = 409;
//     err.code = 'DRC_ALREADY_CONSUMED';
//     throw err;
//   }

//   const current = params.current;
//   if (!current) return;
//   const alreadyConsumed =
//     (Array.isArray(current.transfers) &&
//       current.transfers.some((t: any) => String(t?.drc_certificate_no ?? '').trim() === drcNo)) ||
//     (Array.isArray(current.utilizations) &&
//       current.utilizations.some((u: any) => String(u?.drc_certificate_no ?? '').trim() === drcNo));

//   if (alreadyConsumed) {
//     const err = new Error('same DRC cannot be reused for same Samagra owner') as Error & {
//       statusCode?: number;
//       code?: string;
//     };
//     err.statusCode = 409;
//     err.code = 'DRC_ALREADY_CONSUMED';
//     throw err;
//   }
// }

function buildAreaTdrSummary(row: any) {
  const transferred_tdr_value = Array.isArray(row?.transfers)
    ? row.transfers.reduce((sum: number, t: any) => sum + Number(t?.transferred_tdr_value ?? t?.trn_value_tdr ?? 0), 0)
    : 0;
  const utilized_tdr_value = Array.isArray(row?.utilizations)
    ? row.utilizations.reduce((sum: number, u: any) => sum + Number(u?.utilized_value_tdr ?? 0), 0)
    : Number(row?.utilized_tdr_value ?? 0);
  const transferred_area = Array.isArray(row?.transfers)
    ? row.transfers.reduce((sum: number, t: any) => sum + Number(t?.transferred_area ?? 0), 0)
    : 0;
  const utilized_area = Array.isArray(row?.utilizations)
    ? row.utilizations.reduce((sum: number, u: any) => sum + Number(u?.utilized_area ?? 0), 0)
    : Number(row?.utilized_area ?? 0);
  let total_area = Number(
    row?.original_total_area ?? row?.land?.original_total_area ?? row?.land?.total_area ?? 0
  );
  if (!(total_area > 0) && Array.isArray(row?.plots) && row.plots.length > 0) {
    total_area = row.plots.reduce(
      (sum: number, p: any) =>
        sum + Number(p?.registry_area ?? p?.proposed_area ?? 0),
      0
    );
  }
  const proposed_area = Number(row?.land?.proposed_area ?? 0);
  const storedRemaining = row?.remaining_area;
  const calculatedRemaining = Math.max(0, total_area - transferred_area - utilized_area);
  const remaining_area =
    typeof storedRemaining === 'number' && Number.isFinite(storedRemaining)
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

function validateDrcEligibility(tdr: any): void {
  const project = (tdr?.project ?? {}) as any;
  const status = String(project.status ?? '').toUpperCase();
  const isStatusAllowed = status === 'DRC_GENERATED' || status === 'ACTIVE';
  const hasDrcNo = typeof project.drc_certificate_no === 'string' && project.drc_certificate_no.trim().length > 0;
  const hasDrcDate = Boolean(project.drc_generation_dt);
  const hasDoc = hasDrcDocument(tdr?.documents);

  if (!hasDrcNo || !hasDrcDate || !hasDoc || !isStatusAllowed) {
    const err = new Error('DRC certificate not generated. Transfer/Utilization not allowed') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 409;
    err.code = 'DRC_NOT_READY';
    throw err;
  }
}

export const insertTransferRequestService = async (
  payload: InsertTransferPayload
): Promise<InsertTransferRequestResult> => {
  const tdr = await fetchTdrForOperation(payload.application_id, payload.samagra_id);

  if (!tdr) {
    const err = new Error('TDR record not found for application_id and samagra_id') as Error & {
      statusCode?: number;
    };
    err.statusCode = 404;
    throw err;
  }
  const sourceRid = String((tdr as any).rid);
  validateDrcEligibility(tdr);
  const drcCertificateNo = String((tdr.project as any)?.drc_certificate_no ?? '').trim();
  // await ensureDrcNotConsumedForSamagra({
  //   application_id: payload.application_id,
  //   samagra_id: payload.samagra_id,
  //   drc_certificate_no: drcCertificateNo,
  //   current: tdr
  // });
  const valuation = resolveValuationConfig(tdr);

  const totalTdr = Number(tdr.total_tdr_value ?? (tdr.land as any)?.value_tdr ?? 0);
  const availableTdr =
    typeof tdr.remaining_tdr_value === 'number'
      ? Number(tdr.remaining_tdr_value)
      : totalTdr -
        (Array.isArray(tdr.transfers) && tdr.transfers.length > 0
          ? tdr.transfers.reduce((sum, t: any) => sum + (t.trn_value_tdr ?? 0), 0)
          : 0) -
        (Array.isArray(tdr.utilizations) && tdr.utilizations.length > 0
          ? tdr.utilizations.reduce((sum, u: any) => sum + (u.utilized_value_tdr ?? 0), 0)
          : 0);
  const generatedTdrValue =
    Number(valuation.collector_guideline_rate) * Number(valuation.multiplier_factor) * Number(payload.transferred_area);
  const transferredTdrValue =
    typeof payload.trn_value_tdr === 'number' && payload.trn_value_tdr > 0 ? payload.trn_value_tdr : generatedTdrValue;
  const sourceLand = (tdr.land ?? {}) as Record<string, unknown>;
const sourceTotalArea = Number(
  sourceLand.original_total_area ??
  sourceLand.total_area ??
  0
);  const sourceProposedArea = Number(sourceLand.proposed_area ?? sourceTotalArea);
  const sourceRemainingArea = Number((tdr as any).remaining_area ?? sourceProposedArea);

  if (!Number.isFinite(sourceRemainingArea) || sourceRemainingArea <= 0) {
    const err = new Error('Source owner remaining area is invalid for transfer') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 400;
    err.code = 'INVALID_SOURCE_AREA';
    throw err;
  }

  if (payload.transferred_area > sourceRemainingArea) {
    const err = new Error('Transferred area exceeds remaining source area') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 400;
    err.code = 'INSUFFICIENT_AREA';
    throw err;
  }

  if (transferredTdrValue > availableTdr) {
    const err = new Error('Transfer amount exceeds remaining available TDR') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 400;
    err.code = 'INSUFFICIENT_BALANCE';
    throw err;
  }

  const remainingAfterTransfer = availableTdr - transferredTdrValue;
  const remainingSourceArea = sourceRemainingArea - payload.transferred_area;

  const { application_id: recipient_application_id, tdrApplicationId: recipient_tdrApplicationId, rid: recipient_rid } =
    await generateRecipientAppIdsWithSharedRid(sourceRid);

  const ownerToName =
    payload.owner_to ??
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

  const priorOwnerSnapshot = deepClonePlain((tdr.owner ?? {}) as Record<string, unknown>);
  const recipientOwner = buildTransfereeOwner(priorOwnerSnapshot, payload);
  recipientOwner.current_balance_tdr = transferredTdrValue;
  const recipientProject = stripDrcFromProjectForNewOwner(deepClonePlain((tdr.project ?? {}) as Record<string, unknown>));
 const originalTotalArea = Number(
  (tdr as any)?.land?.original_total_area ??
  (tdr as any)?.land?.total_area ??
  0
);
 
  const recipientLand = {
    ...deepClonePlain(sourceLand),

    // new owner's own area
    total_area: payload.transferred_area,

    proposed_area: payload.transferred_area,

    // keep original parent land history
    original_total_area: originalTotalArea,

    value_tdr: transferredTdrValue,

    transferred_area: payload.transferred_area,

    remaining_source_area: remainingSourceArea,

    collector_guideline_rate:
      valuation.collector_guideline_rate,

    multiplier_factor:
      valuation.multiplier_factor,

    generated_tdr_value:
      generatedTdrValue
};
  const recipientPlots = Array.isArray(tdr.plots) ? deepClonePlain(tdr.plots) : [];


  const updated = await TDR.findOneAndUpdate(
    { application_id: payload.application_id, rid: sourceRid },
    {
      $push: { transfers: transferRecord },
 $set: {
  total_tdr_value: totalTdr,

  remaining_tdr_value: remainingAfterTransfer,

  remaining_area: remainingSourceArea,

  'owner.current_balance_tdr': remainingAfterTransfer,

  'land.original_total_area': originalTotalArea,

  // keep proposed fixed
  'land.value_tdr': remainingAfterTransfer
}
    },
    { new: true }
  );

  if (!updated) {
    const err = new Error('Failed to update TDR record during transfer') as Error & {
      statusCode?: number;
    };
    err.statusCode = 500;
    throw err;
  }

  const senderHash = generateTransferHash({
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

  const senderBlockchainResult = await pushUpdateAsset({
    application_id: payload.application_id,
    rid: sourceRid,
    hash: senderHash
  });

  const transfer_txId = senderBlockchainResult.txId;

  const senderLedger = buildLifecycleLedgerEntry({
    action: 'TRANSFER_OUT',
    document_type: 'TRANSFER',
    performed_by: payload.owner_from,
    previous_status: (updated.project as any)?.status,
    new_status: (updated.project as any)?.status ?? 'ACTIVE',
    remarks: `Transferred ${transferredTdrValue} TDR and ${payload.transferred_area} area to independent application ${recipient_application_id}`,
    txId: transfer_txId,
    hash: senderHash
  });

  await TDR.updateOne(
    { application_id: payload.application_id, rid: sourceRid },
    { $push: { ledger: senderLedger } }
  );

  const recipientDoc: Record<string, unknown> = {
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
    await TDR.create(recipientDoc);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      const err = new Error('Duplicate application mapping for transferee record') as Error & {
        statusCode?: number;
        code?: string;
      };
      err.statusCode = 409;
      err.code = 'TDR_DUPLICATE_ENTRY';
      throw err;
    }
    throw error;
  }

  const recipient_asset_hash = generateIndependentOwnerAssetHash({
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

  const recipientBlockchainResult = await pushCreateAsset({
    application_id: recipient_application_id,
    tdrApplicationId: recipient_tdrApplicationId,
    rid: recipient_rid,
    hash: recipient_asset_hash,
    remaining_tdr_value: transferredTdrValue,
    utilized_tdr_value: 0,
    owner: String((recipientOwner as { name?: string }).name ?? ownerToName),
    district: String((recipientProject as { district?: string }).district ?? '')
  });

  const recipientLedger = buildLifecycleLedgerEntry({
    action: 'TRANSFER_IN',
    document_type: 'TRANSFER',
    performed_by: ownerToName,
    previous_status: undefined,
    new_status: String((recipientProject as { status?: string }).status ?? 'CREATED'),
    remarks: `Received ${transferredTdrValue} TDR and ${payload.transferred_area} area from application ${payload.application_id} (${sourceRid})`,
    txId: recipientBlockchainResult.txId,
    hash: recipient_asset_hash
  });

  await TDR.updateOne({ application_id: recipient_application_id }, { $push: { ledger: recipientLedger } });

return {
    application_id: payload.application_id,

    txId: transfer_txId,

    hash: senderHash,

    // ADD THESE TWO ↓↓↓
    old_total_area: sourceTotalArea,

    old_total_tdr: totalTdr,

    remaining_value_tdr: remainingAfterTransfer,

    old_owner_remaining_tdr: remainingAfterTransfer,

    old_owner_remaining_area: remainingSourceArea,

    transferred_tdr_value: transferredTdrValue,

    transferred_area: payload.transferred_area,

    collector_guideline_rate:
      valuation.collector_guideline_rate,

    multiplier_factor:
      valuation.multiplier_factor,

    generated_tdr_value:
      generatedTdrValue,

    recipient_application_id,
    recipient_tdrApplicationId,
    recipient_rid,

    new_owner_application_id:
      recipient_application_id,

    new_owner_tdrApplicationId:
      recipient_tdrApplicationId,

    new_owner_rid:
      recipient_rid,

    recipient_asset_txId:
      recipientBlockchainResult.txId,

    recipient_asset_hash,

    source_application_id:
      payload.application_id,

    source_rid: sourceRid,

    transferred_from_owner:
      payload.owner_from,

    transfer_txId
};
};

function generateUtilizationHash(input: {
  application_id: string;
  rid: string;
  balances: { total: number; utilized: number; remaining: number };
  areas: { total: number; utilized: number; remaining: number };
  valuation: {
    collector_guideline_rate: number;
    multiplier_factor: number;
    generated_utilized_tdr_value: number;
    utilized_tdr_value: number;
  };
  utilizations: unknown;
  remarks: string;
}): string {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function generateNewDrcOwnerHash(input: {
  application_id: string;
  owner_id: string;
  drc_certificate_no: string;
  collector_guideline_rate: number;
  multiplier_factor: number;
  new_drc_of_owner: unknown;
}): string {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export const insertUtilizationRequestService = async (
  payload: InsertUtilizationPayload
): Promise<{
  txId: string;
  hash: string;
  utilization_id: string;
  old_total_tdr: number;
  remaining_tdr_value: number;
  utilized_tdr_value: number;
  old_total_area: number;
  remaining_area: number;
  utilized_area: number;
  collector_guideline_rate: number;
  multiplier_factor: number;
  generated_utilized_tdr_value: number;
}> => {
  const tdr = await fetchTdrForOperation(payload.application_id, payload.samagra_id);

  if (!tdr) {
    const err = new Error('TDR record not found for application_id and samagra_id') as Error & {
      statusCode?: number;
    };
    err.statusCode = 404;
    throw err;
  }
  const rid = String((tdr as any).rid);
  validateDrcEligibility(tdr);
  // await ensureDrcNotConsumedForSamagra({
  //   application_id: payload.application_id,
  //   samagra_id: payload.samagra_id,
  //   drc_certificate_no: payload.drc_certificate_no,
  //   current: tdr
  // });
  const valuation = resolveValuationConfig(tdr);

  const total = Number(tdr.total_tdr_value ?? (tdr.land as any)?.value_tdr ?? 0);
  const utilizedSoFar = Number(tdr.utilized_tdr_value ?? 0);
const totalArea = Number(
 (tdr.land as any)?.original_total_area ??
 (tdr.land as any)?.total_area ??
 0
);
  const proposedArea = Number((tdr.land as any)?.proposed_area ?? totalArea);
  const remainingArea =
    typeof (tdr as any).remaining_area === 'number' ? Number((tdr as any).remaining_area) : proposedArea;
  const utilizedAreaSoFar = Number((tdr as any).utilized_area ?? 0);
  const remaining =
    typeof tdr.remaining_tdr_value === 'number'
      ? Number(tdr.remaining_tdr_value)
      : total -
        (Array.isArray(tdr.transfers) && tdr.transfers.length > 0
          ? tdr.transfers.reduce((sum, t: any) => sum + (t.trn_value_tdr ?? 0), 0)
          : 0) -
        (Array.isArray(tdr.utilizations) && tdr.utilizations.length > 0
          ? tdr.utilizations.reduce((sum, u: any) => sum + (u.utilized_value_tdr ?? 0), 0)
          : 0);

  const generatedUtilizedTdrValue =
    Number(valuation.collector_guideline_rate) * Number(valuation.multiplier_factor) * Number(payload.utilized_area);
  const utilizedValueTdr =
    typeof payload.utilized_value_tdr === 'number' && payload.utilized_value_tdr > 0
      ? payload.utilized_value_tdr
      : generatedUtilizedTdrValue;

  if (payload.utilized_area > remainingArea) {
    const err = new Error('Utilized area exceeds remaining available area') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 400;
    err.code = 'INSUFFICIENT_AREA';
    throw err;
  }

  if (utilizedValueTdr > remaining) {
    const err = new Error('Utilized amount exceeds remaining available TDR') as Error & {
      statusCode?: number;
      code?: string;
    };
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


  const originalTotalArea = Number(
 (tdr as any)?.land?.original_total_area ??
 (tdr as any)?.land?.total_area ??
 0
);
  const updated = await TDR.findOneAndUpdate(
    { application_id: payload.application_id, rid },
    {
      $push: { utilizations: utilizationEntry },
$set: {
  total_tdr_value: total,

  utilized_tdr_value: nextUtilized,

  remaining_tdr_value: afterBalance,

  utilized_area: nextUtilizedArea,

  remaining_area: afterArea,

  'owner.current_balance_tdr': afterBalance,

  'land.original_total_area': originalTotalArea,

  // proposed fixed rahega
  'land.value_tdr': afterBalance
}
    },
    { new: true }
  );

  if (!updated) {
    const err = new Error('Failed to update TDR record during utilization') as Error & {
      statusCode?: number;
    };
    err.statusCode = 500;
    throw err;
  }

  const hash = generateUtilizationHash({
    application_id: payload.application_id,
    rid,
    balances: { total, utilized: nextUtilized, remaining: afterBalance },
    areas: { total: totalArea, utilized: nextUtilizedArea, remaining: afterArea },
    valuation: {
      collector_guideline_rate: valuation.collector_guideline_rate,
      multiplier_factor: valuation.multiplier_factor,
      generated_utilized_tdr_value: generatedUtilizedTdrValue,
      utilized_tdr_value: utilizedValueTdr
    },
    utilizations: updated.utilizations,
    remarks: 'TDR utilized successfully'
  });

  const blockchainResult = await pushUpdateAsset({
    application_id: payload.application_id,
    rid,
    hash
  });

  const utilizationLedger = buildLifecycleLedgerEntry({
    action: 'UTILIZATION_ADDED',
    document_type: 'UTILIZATION',
    performed_by: payload.utilized_by,
    previous_status: (updated.project as any)?.status,
    new_status: (updated.project as any)?.status ?? 'ACTIVE',
    remarks: `Utilized ${utilizedValueTdr} TDR and ${payload.utilized_area} area for ${payload.utilization_purpose}`,
    txId: blockchainResult.txId,
    hash
  });

  await TDR.updateOne({ application_id: payload.application_id, rid }, { $push: { ledger: utilizationLedger } });

  return {
    txId: blockchainResult.txId,
    hash,
    utilization_id: payload.utilization_id,
    old_total_tdr: total,
    remaining_tdr_value: afterBalance,
    utilized_tdr_value: nextUtilized,
    old_total_area: totalArea,
    remaining_area: afterArea,
    utilized_area: nextUtilizedArea,
    collector_guideline_rate: valuation.collector_guideline_rate,
    multiplier_factor: valuation.multiplier_factor,
    generated_utilized_tdr_value: generatedUtilizedTdrValue
  };
};

export const newDrcOfOwnerService = async (
  payload: NewDrcOfOwnerPayload
): Promise<{
  application_id: string;
  samagra_id: string;
  txId: string;
  hash: string;
  drc_id: string;
  drc_certificate_no: string;
  drc_generation_dt: Date;
}> => {
  const tdr = await TDR.findOne({
    application_id: payload.application_id,
    'owner.samagra_id': payload.samagra_id
  });
  if (!tdr) {
    const err = new Error('TDR record not found for application_id and samagra_id') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  const application_id = String((tdr as any).application_id);
  const drcCertificateNo = String(payload.drc_certificate_no).trim();
  const drcId = String(payload.drc_id).trim();
  if (!drcCertificateNo) {
    const err = new Error('drc_certificate_no is required') as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }
  if (!drcId) {
    const err = new Error('drc_id is required') as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }

  const duplicateDrcCertNo = await TDR.findOne({
    'owner.samagra_id': payload.samagra_id,
    $or: [
      { 'project.drc_certificate_no': drcCertificateNo },
      { 'new_drc_of_owner.drc_certificate_no': drcCertificateNo }
    ]
  })
    .select({ application_id: 1 })
    .lean();

  if (duplicateDrcCertNo) {
    const err = new Error('same DRC certificate number cannot be reused for same Samagra owner') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 409;
    err.code = 'DRC_CERTIFICATE_REUSE';
    throw err;
  }

  const duplicateDrcId = await TDR.findOne({
    'owner.samagra_id': payload.samagra_id,
    $or: [
      { 'project.drc_id': drcId },
      { 'new_drc_of_owner.drc_id': drcId }
    ]
  })
    .select({ application_id: 1 })
    .lean();

  if (duplicateDrcId) {
    const err = new Error('same drc_id cannot be reused for same Samagra owner') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 409;
    err.code = 'DRC_ID_REUSE';
    throw err;
  }

  const existingTdrValue = Number(
  (tdr as any)?.remaining_tdr_value ??
  (tdr as any)?.total_tdr_value ??
  0
);

console.log("OLD TDR VALUE =>", existingTdrValue);

  const drcGenerationDt = payload.drc_generation_dt ? new Date(payload.drc_generation_dt) : new Date();
  const uploadedAt = new Date();
  const drcDocHash = await generateDataHash({
    application_id,
    rid: String((tdr as any).rid),
    document_type: 'DRC_CERTIFICATE',
    file_url: payload.drc_certificate_doc_path,
    uploaded_at: uploadedAt.toISOString()
  });

  // Owner consistency check: only validate owner_id.
  // Do NOT modify any owner fields in DB for this API.
  const priorOwnerId = (tdr as any)?.owner?.owner_id;

  console.log("DB OWNER => ", priorOwnerId);
  console.log("REQUEST OWNER => ", payload.owner_id);
  
  const incomingOwnerId = String(payload.owner_id ?? '').trim();
  
  if (!incomingOwnerId) {
    const err = new Error('owner_id is required') as Error & {
      statusCode?: number;
      code?: string;
    };
  
    err.statusCode = 400;
    err.code = 'OWNER_ID_REQUIRED';
    throw err;
  }
  
  if (
    priorOwnerId &&
    String(priorOwnerId).trim() !== incomingOwnerId
  ) {
    const err = new Error(
      'Owner id mismatch: new DRC owner_id must match existing TDR owner id'
    ) as Error & {
      statusCode?: number;
      code?: string;
    };
  
    err.statusCode = 409;
    err.code = 'OWNER_ID_MISMATCH';
    throw err;
  }



const finalTdrValue = Number(
  payload.tdr_value || existingTdrValue
);

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

  // use request value if passed, else current balance
  tdr_value: String(finalTdrValue),

  collector_guideline_rate:
    payload.collector_guideline_rate,

  multiplier_factor:
    payload.multiplier_factor,

  drc_id: drcId,
  drc_certificate_no: drcCertificateNo,
  drc_generation_dt: drcGenerationDt
};

  const updated = await TDR.findOneAndUpdate(
    { application_id, 'owner.samagra_id': payload.samagra_id },
    {
      $push: { new_drc_of_owner: newDrcRecord },
     $set: {
  'project.drc_id': drcId,
  'project.drc_certificate_no': drcCertificateNo,
  'project.drc_generation_dt': drcGenerationDt,
  'project.status': 'DRC_GENERATED',

  'project.collector_guideline_rate':
  payload.collector_guideline_rate,

  'project.multiplier_factor':
  payload.multiplier_factor,

  // OVERWRITE
  total_tdr_value: finalTdrValue,

  remaining_tdr_value: finalTdrValue,

  'land.value_tdr': finalTdrValue,

  'owner.current_balance_tdr':
  finalTdrValue,

  'documents.drc_certificate': {
    file_url: payload.drc_certificate_doc_path,
    hash: drcDocHash,
    uploaded_at: uploadedAt
  }

      }
    },
    { new: true }
  );

  if (!updated) {
    const err = new Error('Failed to update TDR record for NewDRCOfOwner') as Error & { statusCode?: number };
    err.statusCode = 500;
    throw err;
  }

  const hash = generateNewDrcOwnerHash({
    application_id,
    owner_id: payload.owner_id,
    drc_certificate_no: drcCertificateNo,
    collector_guideline_rate: payload.collector_guideline_rate,
    multiplier_factor: payload.multiplier_factor,
    new_drc_of_owner: (updated as any).new_drc_of_owner ?? []
  });

  let blockchainResult: Awaited<ReturnType<typeof pushUpdateAsset>>;
  try {
    blockchainResult = await pushUpdateAsset({
      application_id,
      rid: (updated as any).rid,
      hash
    });
  } catch (e) {
    // If blockchain update fails, the DRC row is already inserted in Mongo.
    // Returning a clear error helps client to retry/resolve mismatch.
    const err = new Error('NewDRC upload saved in Mongo but blockchain push failed (please retry)') as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 409;
    err.code = 'BLOCKCHAIN_PUSH_FAILED_CLEAR_MISSING_OK';
    throw err;
  }

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

export const insertObjectionSuggestionService = async (
  payload: InsertObjectionSuggestionPayload
): Promise<{ application_id: string; txId: string; hash: string }> => {
  const existing = await TDR.findOne({ application_id: payload.applicationid });
  if (!existing) {
    const err = new Error('TDR record not found for applicationid') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

  const blockchainResult = await pushUpdateAsset({
    application_id: payload.applicationid,
    rid: String(payload.p_rid),
    land_objection_count: payload.objectionSuggestionLand?.length ?? 0,
    plot_objection_count: payload.objectionSuggestionPlot?.length ?? 0,
    submit_status: payload.p_submit_status,
    updated_by: payload.p_updatedbyuserid,
    updated_role: payload.p_updatedbyroleid,
    hash
  });

  const ledgerEntry = buildLifecycleLedgerEntry({
    action: 'OBJECTION_SUGGESTION_INSERTED',
    document_type: 'OBJECTION_SUGGESTION',
    performed_by: String(payload.p_updatedbyuserid),
    previous_status: (existing.project as any)?.status,
    new_status: (existing.project as any)?.status ?? 'UPDATED',
    remarks: payload.p_updatedby_remarks,
    txId: blockchainResult.txId,
    hash
  });

  const updated = await TDR.findOneAndUpdate(
    {
      application_id: payload.applicationid
    },
    {
      $push: {
        objection_suggestions: {
          ...payload,
          created_at: new Date()
        },
        ledger: ledgerEntry
      }
    },
    { new: true }
  );

  if (!updated) {
    const err = new Error('Failed to update objection_suggestions') as Error & { statusCode?: number };
    err.statusCode = 500;
    throw err;
  }

  return {
    application_id: payload.applicationid,
    txId: blockchainResult.txId,
    hash
  };
};

function generateReadyForDrcHash(input: {
  application_id: string;
  rid: string;
  project: { status: string; project_stage: string };
}): string {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function buildLedgerEntry(params: {
  performed_by: string;
  previous_status?: string;
  remarks?: string;
  txId: string;
  hash: string;
}) {
  return {
    action: 'READY_FOR_DRC',
    performed_by: params.performed_by,
    previous_status: params.previous_status,
    new_status: 'READY_FOR_DRC',
    remarks: params.remarks,
    txId: params.txId,
    hash: params.hash,
    createdAt: new Date()
  };
}

export const updateOwnerReadyForDrcService = async (
  payload: UpdateOwnerReadyForDrcPayload
): Promise<{ application_id: string; samagra_id: string; txId: string; hash: string }> => {
  const existing = await TDR.findOne({
    application_id: payload.application_id,
    'owner.samagra_id': payload.samagra_id
  });

  if (!existing) {
    const err = new Error('TDR record not found for application_id and samagra_id') as Error & {
      statusCode?: number;
    };
    err.statusCode = 404;
    throw err;
  }

  const previousStatus = (existing.project as any)?.status as string | undefined;
  const rid = String((existing as any).rid);
  const hash = generateReadyForDrcHash({
    application_id: payload.application_id,
    rid,
    project: { status: 'READY_FOR_DRC', project_stage: 'READY_FOR_DRC' }
  });

  // Second/next push on same blockchain asset, never createAsset.
  const blockchainResult = await pushUpdateAsset({
    application_id: payload.application_id,
    rid,
    hash
  });

  const ledgerEntry = buildLedgerEntry({
    performed_by: payload.performed_by,
    previous_status: previousStatus,
    remarks: payload.remarks,
    txId: blockchainResult.txId,
    hash
  });

  const updated = await TDR.findOneAndUpdate(
    { application_id: payload.application_id, rid },
    {
      $set: {
        'project.status': 'READY_FOR_DRC',
        'project.project_stage': 'READY_FOR_DRC'
      },
      $push: {
        ledger: ledgerEntry
      }
    },
    { new: true }
  );

  if (!updated) {
    const err = new Error('Failed to update READY_FOR_DRC workflow stage') as Error & {
      statusCode?: number;
    };
    err.statusCode = 500;
    throw err;
  }

  return {
    application_id: payload.application_id,
    samagra_id: payload.samagra_id,
    txId: blockchainResult.txId,
    hash
  };
};
