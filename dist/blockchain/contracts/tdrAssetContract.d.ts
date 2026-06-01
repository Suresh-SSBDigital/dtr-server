declare let ContractBase: any;
export interface ChainAsset {
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    hash: string;
    txId: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    lastAction: string;
    ledgerSnapshot: number;
    utilized_tdr_value: number;
    remaining_tdr_value: number;
    owner?: string;
    district?: string;
}
export interface ChainAssetInput {
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    hash: string;
    txId?: string;
    timestamp?: string;
    status?: string;
    lastAction?: string;
    ledgerSnapshot?: number;
    utilized_tdr_value?: number;
    remaining_tdr_value?: number;
    owner?: string;
    district?: string;
}
export interface ChainAssetHistoryEntry {
    txId: string;
    timestamp: string;
    value: ChainAsset | null;
    isDelete: boolean;
}
export declare const assetExists: (application_id: string) => Promise<boolean>;
export declare const createAsset: (asset: ChainAssetInput) => Promise<ChainAsset>;
export declare const updateAsset: (asset: ChainAssetInput) => Promise<ChainAsset>;
export declare const readAsset: (application_id: string) => Promise<ChainAsset>;
export declare const getAsset: (application_id: string) => Promise<ChainAsset | null>;
export declare const getAssetByRid: (rid: string) => Promise<ChainAsset | null>;
export declare const getAssetHistory: (application_id: string) => Promise<ChainAssetHistoryEntry[]>;
/** Alias for Fabric chaincode / peers: `getHistory` */
export declare const getHistory: (application_id: string) => Promise<ChainAssetHistoryEntry[]>;
export declare const getAllAssets: () => Promise<ChainAsset[]>;
export declare const deleteAsset: (application_id: string) => Promise<void>;
export declare const getAssetsByStatus: (status: string) => Promise<ChainAsset[]>;
export declare const getAssetsByRid: (rid: string) => Promise<ChainAsset[]>;
export declare const getAssetsByOwner: (owner: string) => Promise<ChainAsset[]>;
export declare const getAssetsByDistrict: (district: string) => Promise<ChainAsset[]>;
export declare class TdrAssetContract extends ContractBase {
    constructor();
    createAsset(ctx: any, assetJson: string): Promise<string>;
    updateAsset(ctx: any, assetJson: string): Promise<string>;
    readAsset(ctx: any, application_id: string): Promise<string>;
    getAssetByRid(ctx: any, rid: string): Promise<string>;
    getAssetHistory(ctx: any, application_id: string): Promise<string>;
    /** Peer: `{"Args":["getHistory","<application_id>"]}` — same data as getAssetHistory */
    getHistory(ctx: any, application_id: string): Promise<string>;
    getAllAssets(ctx: any): Promise<string>;
    assetExists(ctx: any, application_id: string): Promise<string>;
    getAssetsByStatus(ctx: any, status: string): Promise<string>;
    getAssetsByRid(ctx: any, rid: string): Promise<string>;
    getAssetsByOwner(ctx: any, owner: string): Promise<string>;
    getAssetsByDistrict(ctx: any, district: string): Promise<string>;
}
export {};
//# sourceMappingURL=tdrAssetContract.d.ts.map