type DocumentType = 'form1' | 'form11' | 'form12' | 'form13';
export interface UploadDocumentPayload {
    application_id: string;
    samagra_id: string;
    performed_by: string;
    file_url: string;
    document_type: DocumentType;
    remarks?: string;
    utilized_tdr?: number;
    ledger_snapshot?: number;
    utilization_id?: string;
    drc_id?: string;
    drc_certificate_no?: string;
    approval_authority?: string;
}
export declare const uploadLifecycleDocument: (payload: UploadDocumentPayload) => Promise<{
    txId: string;
    hash: string;
    application_id: string;
    rid: string;
}>;
export declare const getLedgerSnapshot: (application_id: string, samagra_id: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/tdr").TDRDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/tdr").TDRDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const generateLedgerHash: (application_id: string, samagra_id: string) => Promise<{
    hash: string;
    snapshot: import("mongoose").Document<unknown, {}, import("../models/tdr").TDRDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/tdr").TDRDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
}>;
export {};
//# sourceMappingURL=tdrDocumentService.d.ts.map