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
export declare const getTdrHistoryService: (application_id: string) => Promise<{
    application_id: string;
    tdr: unknown;
    history: Array<{
        txId: string;
        timestamp: string;
        value: unknown;
        isDelete: boolean;
    }>;
}>;
export declare const getAllApplicationsService: () => Promise<Array<{
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
}>>;
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
    blockchain_history: Array<{
        txId: string;
        timestamp: string;
        value: unknown;
        isDelete: boolean;
    }>;
}
export declare const getAllApplicationsHistoryListService: () => Promise<{
    applications: ApplicationHistoryListItem[];
    count: number;
}>;
/** Full MongoDB TDR document (all fields) for application_id + owner.samagra_id. */
export declare const getTdrFullByApplicationAndSamagraService: (application_id: string, samagra_id: string) => Promise<Record<string, unknown>>;
/** Full DRC view by drc_id (excluding transfers and utilizations arrays). */
export declare const getDrcDetailsByIdService: (drc_id: string) => Promise<Record<string, unknown>>;
/** All Mongo rows with this RID — DRC-focused projection (multiple rows after transfer share RID). */
export declare const getAllDrcInfoByRidService: (rid: string) => Promise<Array<{
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
}>>;
/** Mongo + chain history for every application that shares this RID (transfer source/recipient, etc.). */
export declare const getAllHistoryByRidService: (rid: string) => Promise<{
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
        history: Array<{
            txId: string;
            timestamp: string;
            value: unknown;
            isDelete: boolean;
        }>;
    }>;
}>;
/** Blockchain-only history for one application (no Mongo read). */
export declare const getBlockchainHistoryForApplicationService: (application_id: string) => Promise<{
    history: Array<{
        txId: string;
        timestamp: string;
        value: unknown;
        isDelete: boolean;
    }>;
    summary: Record<string, number>;
}>;
export declare const getAllDrcCertificatesService: () => Promise<Array<{
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
}>>;
declare function mapDrcRow(row: any): {
    application_id: any;
    tdrApplicationId: any;
    rid: any;
    samagra_id: any;
    owner_name: any;
    drc_id: any;
    drc_certificate_no: any;
    drc_generation_dt: any;
    drc_date: any;
    status: any;
    drc_status: any;
    total_area: any;
    proposed_area: any;
    remaining_area: any;
    remaining_tdr_value: any;
    drc_certificate: any;
    updatedAt: any;
};
/**
 * Paginated DRC certificate list with DB-level skip/limit so the full
 * collection is never loaded into memory for a single page fetch.
 */
export declare const getPaginatedDrcCertificatesService: (opts: {
    limit: number;
    offset: number;
    sortDir: 1 | -1;
    search?: string;
}) => Promise<{
    certificates: ReturnType<typeof mapDrcRow>[];
    countTotal: number;
}>;
export declare const getAllTransfersService: () => Promise<Array<{
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
}>>;
export declare const getAllUtilizationsService: () => Promise<Array<{
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
}>>;
export declare const createTdrApplication: (payload: CreateTdrPayload) => Promise<{
    application_id: string;
    tdrApplicationId: string;
    samagra_id: string;
    rid: string;
    txId: string;
    hash: string;
}>;
export declare const updateDrcService: (payload: UpdateDrcPayload) => Promise<{
    application_id: string;
    txId: string;
    hash: string;
}>;
export declare const insertTransferRequestService: (payload: InsertTransferPayload) => Promise<InsertTransferRequestResult>;
export declare const insertUtilizationRequestService: (payload: InsertUtilizationPayload) => Promise<{
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
}>;
export declare const newDrcOfOwnerService: (payload: NewDrcOfOwnerPayload) => Promise<{
    application_id: string;
    samagra_id: string;
    txId: string;
    hash: string;
    drc_id: string;
    drc_certificate_no: string;
    drc_generation_dt: Date;
}>;
export declare const insertObjectionSuggestionService: (payload: InsertObjectionSuggestionPayload) => Promise<{
    application_id: string;
    txId: string;
    hash: string;
}>;
export declare const updateOwnerReadyForDrcService: (payload: UpdateOwnerReadyForDrcPayload) => Promise<{
    application_id: string;
    samagra_id: string;
    txId: string;
    hash: string;
}>;
export {};
//# sourceMappingURL=tdrService.d.ts.map