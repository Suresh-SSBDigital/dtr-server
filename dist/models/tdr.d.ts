import mongoose, { Document } from 'mongoose';
export interface TDRPlot {
    plot_id: string;
    plot_no: string;
    registry_area: number;
    proposed_area: number;
    ownership: string;
    latitude: number;
    longitude: number;
}
export interface TDRTransfer {
    trn_id: string;
    owner_from: string;
    owner_to?: string;
    trn_value_tdr: number;
    original_tdr_value?: number;
    transferred_tdr_value?: number;
    generated_tdr_value?: number;
    remaining_value_tdr: number;
    transferred_area?: number;
    remaining_area?: number;
    collector_guideline_rate?: number;
    multiplier_factor?: number;
    trn_date: Date;
    status: string;
    /** Lightweight audit: independent recipient application created from this transfer */
    recipient_application_id?: string;
    recipient_rid?: string;
    recipient_tdrApplicationId?: string;
}
export interface TDRUtilization {
    utilization_id: string;
    drc_id: string;
    drc_certificate_no: string;
    utilized_by: string;
    utilized_value_tdr: number;
    generated_utilized_tdr_value?: number;
    original_tdr_value?: number;
    remaining_tdr_value?: number;
    utilized_area?: number;
    before_utilization_area?: number;
    after_utilization_area?: number;
    remaining_area?: number;
    collector_guideline_rate?: number;
    multiplier_factor?: number;
    before_utilization_balance: number;
    after_utilization_balance: number;
    utilization_purpose: string;
    utilization_date: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    remarks?: string;
}
export interface TDRLedgerEntry {
    action: string;
    document_type?: string;
    performed_by: string;
    previous_status?: string;
    new_status: string;
    remarks?: string;
    txId: string;
    hash: string;
    createdAt: Date;
}
export interface NewDRCOfOwner {
    querytype: string;
    owner_id: string;
    drc_certificate_doc_name: string;
    drc_certificate_doc_path: string;
    drc_receipt_no: string;
    drc_file_no: string;
    isSigned: string;
    application_id: string;
    is_digital_sign: string;
    tdr_value: string;
    drc_certificate_no: string;
}
export interface ObjectionSuggestion {
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
    created_at?: Date;
}
export interface TDRDocumentFileRef {
    file_url: string;
    hash: string;
    uploaded_at: Date;
    utilized_tdr?: number;
    ledger_snapshot?: number;
    utilization_id?: string;
    drc_id?: string;
    drc_certificate_no?: string;
    approval_authority?: string;
}
export interface TDRDocument extends Document {
    application_id: string;
    tdrApplicationId: string;
    rid: string;
    /** Optional audit only: prior independent application when this row was created via transfer */
    source_application_id?: string;
    source_rid?: string;
    transferred_from_owner?: string;
    /** Blockchain tx id from the sender’s `pushUpdateAsset` for this transfer (audit) */
    transfer_txId?: string;
    /** Derived balance fields maintained by lifecycle APIs */
    total_tdr_value?: number;
    utilized_tdr_value?: number;
    remaining_tdr_value?: number;
    owner: {
        owner_id: string;
        owner_type: string;
        owner_gender: string;
        owner_ekyc: boolean;
        is_first_owner: boolean;
        name: string;
        dob: string;
        samagra_id: string;
        mobile: string;
        email: string;
        address: string;
        owner_name_hash?: string;
        owner_mobile_hash?: string;
    };
    project: {
        project_name: string;
        implement_agency: string;
        district: string;
        tehsil: string;
        village: string;
        project_stage: string;
        govt_order_no?: string;
        govt_order_dt?: Date;
        drc_certificate_no?: string;
        drc_id?: string;
        drc_generation_dt?: Date;
        status: string;
    };
    land: {
        land_id: string;
        khasra_no: string;
        total_area: number;
        proposed_area: number;
        value_tdr: number;
    };
    plots: TDRPlot[];
    transfers: TDRTransfer[];
    utilizations: TDRUtilization[];
    new_drc_of_owner?: NewDRCOfOwner[];
    objection_suggestions?: ObjectionSuggestion[];
    ledger?: TDRLedgerEntry[];
    documents: {
        form1?: TDRDocumentFileRef;
        form4?: TDRDocumentFileRef;
        drc_certificate?: TDRDocumentFileRef;
        form11?: TDRDocumentFileRef;
        form12?: TDRDocumentFileRef;
        form13?: TDRDocumentFileRef;
    };
}
declare const _default: mongoose.Model<TDRDocument, {}, {}, {}, mongoose.Document<unknown, {}, TDRDocument, {}, mongoose.DefaultSchemaOptions> & TDRDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, TDRDocument>;
export default _default;
//# sourceMappingURL=tdr.d.ts.map