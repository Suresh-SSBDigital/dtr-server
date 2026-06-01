import type { NextFunction, Request, Response } from 'express';
/**
 * GET /api/tdr/history/applications — list all applications with blockchain history per app.
 */
export declare const getApplicationsHistoryList: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/tdr/:application_id/full?samagra_id=... — full TDR document from Mongo (all stored fields).
 */
export declare const getTdrFullByKeys: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/tdr/:application_id/blockchain/history — ledger from smart contract (`getHistory` / getAssetHistory).
 */
export declare const getBlockchainHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllDrcCertificates: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/tdr/drc-certificates?limit=10&offset=0&sortDir=desc&search=...
 * Paginated + projected DRC certificate list for fast UI.
 */
export declare const getPaginatedDrcCertificates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/tdr/drc/:drc_id — DRC details by drc_id (without transfers and utilizations).
 */
export declare const getDrcDetailsById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllTransfers: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllUtilizations: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/tdr/rid/:rid/drc-info — all Mongo applications with this RID + DRC-related fields.
 */
export declare const getAllDrcInfoByRid: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/tdr/rid/:rid/history — per application sharing this RID: Mongo ledger, transfers, utilizations,
 * area/TDR summary, owner/source linkage, plus chain history (`history`).
 */
export declare const getAllHistoryByRid: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=tdrHistoryController.d.ts.map