import { type ChainAsset } from '../blockchain/contracts/tdrAssetContract';
interface CreateAssetPayload {
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    hash: string;
    remaining_tdr_value?: number;
    utilized_tdr_value?: number;
    owner?: string;
    district?: string;
}
interface UpdateAssetPayload {
    application_id: string;
    tdrApplicationId?: string;
    rid: string;
    hash: string;
    land_objection_count?: number;
    plot_objection_count?: number;
    submit_status?: string;
    updated_by?: number;
    updated_role?: number;
}
export declare const pushCreateAsset: (payload: CreateAssetPayload) => Promise<{
    txId: string;
    success: boolean;
}>;
export declare const pushUpdateAsset: (payload: UpdateAssetPayload) => Promise<{
    txId: string;
    success: boolean;
}>;
export declare const fetchAssetHistory: (application_id: string) => Promise<Array<{
    txId: string;
    timestamp: string;
    value: unknown;
    isDelete: boolean;
}>>;
/** Same ledger as `fetchAssetHistory`; maps to chaincode method `getHistory`. */
export declare const fetchBlockchainHistory: (application_id: string) => Promise<import("../blockchain/contracts/tdrAssetContract").ChainAssetHistoryEntry[]>;
export declare const fetchAssetByApplicationId: (application_id: string) => Promise<ChainAsset | null>;
export declare const fetchAssetByRid: (rid: string) => Promise<ChainAsset | null>;
export {};
//# sourceMappingURL=blockchainService.d.ts.map