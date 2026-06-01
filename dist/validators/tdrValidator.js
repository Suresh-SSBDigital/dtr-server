"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tdrFullQuerySchema = exports.generateLedgerHashSchema = exports.getLedgerSnapshotSchema = exports.uploadLegalLedgerSnapshotSchema = exports.uploadForm13Schema = exports.uploadForm11Schema = exports.uploadForm12Schema = exports.uploadForm1Schema = exports.updateOwnerReadyForDrcSchema = exports.insertObjectionSuggestionSchema = exports.newDrcOfOwnerSchema = exports.insertUtilizationSchema = exports.insertTransferSchema = exports.updateDrcSchema = exports.createTdrSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const ownerSchema = joi_1.default.object({
    owner_id: joi_1.default.string().optional(),
    owner_type: joi_1.default.string().optional(),
    owner_gender: joi_1.default.string().optional(),
    owner_ekyc: joi_1.default.boolean().optional(),
    is_first_owner: joi_1.default.boolean().optional(),
    name: joi_1.default.string().required(),
    dob: joi_1.default.string().optional(),
    samagra_id: joi_1.default.string().required(),
    mobile: joi_1.default.string().optional(),
    email: joi_1.default.string().email().optional(),
    address: joi_1.default.string().optional(),
    owner_name_hash: joi_1.default.string().optional(),
    owner_mobile_hash: joi_1.default.string().optional()
}).required();
const projectSchema = joi_1.default.object({
    project_name: joi_1.default.string().required(),
    implement_agency: joi_1.default.string().optional(),
    district: joi_1.default.string().optional(),
    tehsil: joi_1.default.string().optional(),
    village: joi_1.default.string().optional(),
    project_stage: joi_1.default.string().optional(),
    govt_order_no: joi_1.default.string().optional(),
    govt_order_dt: joi_1.default.date().optional(),
    drc_certificate_no: joi_1.default.string().optional(),
    drc_generation_dt: joi_1.default.date().optional(),
    status: joi_1.default.string().default('CREATED')
}).required();
const landSchema = joi_1.default.object({
    land_id: joi_1.default.string().optional(),
    khasra_no: joi_1.default.string().required(),
    total_area: joi_1.default.number().required(),
    proposed_area: joi_1.default.number().optional(),
    value_tdr: joi_1.default.number().optional()
}).required();
const plotSchema = joi_1.default.object({
    plot_id: joi_1.default.string().optional(),
    plot_no: joi_1.default.string().optional(),
    registry_area: joi_1.default.number().optional(),
    proposed_area: joi_1.default.number().optional(),
    ownership: joi_1.default.string().optional(),
    latitude: joi_1.default.number().optional(),
    longitude: joi_1.default.number().optional()
});
const documentsSchema = joi_1.default.object({
    form1: joi_1.default.string().optional(),
    form4: joi_1.default.string().optional(),
    drc_certificate: joi_1.default.string().optional()
}).default({});
exports.createTdrSchema = joi_1.default.object({
    tdrApplicationId: joi_1.default.string().required(),
    rid: joi_1.default.string().required(),
    owner: ownerSchema,
    project: projectSchema,
    land: landSchema,
    plots: joi_1.default.array().items(plotSchema).default([]),
    documents: documentsSchema
}).required();
exports.updateDrcSchema = joi_1.default.object({
    application_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required(),
    drc_id: joi_1.default.string().required(),
    drc_certificate_no: joi_1.default.string().required(),
    drc_generation_dt: joi_1.default.date().required(),
    form4: joi_1.default.string().required(),
    drc_certificate: joi_1.default.string().required()
}).required();
/** Optional; when omitted, transferee owner is derived from `owner_to` + parent owner defaults. */
const transfereeOwnerSchema = joi_1.default.object({
    owner_id: joi_1.default.string().optional(),
    owner_type: joi_1.default.string().optional(),
    owner_gender: joi_1.default.string().optional(),
    gender: joi_1.default.string().optional(),
    owner_ekyc: joi_1.default.boolean().optional(),
    is_first_owner: joi_1.default.boolean().optional(),
    owner_name: joi_1.default.string().optional(),
    name: joi_1.default.string().optional(),
    dob: joi_1.default.string().optional(),
    samagra_id: joi_1.default.string().required(),
    mobile: joi_1.default.string().optional(),
    email: joi_1.default.string().email().optional(),
    address: joi_1.default.string().optional(),
    owner_name_hash: joi_1.default.string().optional(),
    owner_mobile_hash: joi_1.default.string().optional()
})
    .or('owner_name', 'name')
    .required();
exports.insertTransferSchema = joi_1.default.object({
    application_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required(),
    trn_id: joi_1.default.string().required(),
    owner_from: joi_1.default.string().required(),
    owner_to: joi_1.default.string().optional(),
    trn_value_tdr: joi_1.default.number().positive().optional(),
    transferred_area: joi_1.default.number().positive().required(),
    trn_date: joi_1.default.date().required(),
    status: joi_1.default.string().required(),
    transferee_owner: transfereeOwnerSchema
}).required();
exports.insertUtilizationSchema = joi_1.default.object({
    application_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required(),
    utilization_id: joi_1.default.string().required(),
    drc_id: joi_1.default.string().required(),
    drc_certificate_no: joi_1.default.string().required(),
    utilized_by: joi_1.default.string().required(),
    utilized_value_tdr: joi_1.default.number().positive().optional(),
    utilized_area: joi_1.default.number().positive().required(),
    utilization_purpose: joi_1.default.string().required(),
    utilization_date: joi_1.default.date().required(),
    status: joi_1.default.string().valid('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED').required(),
    remarks: joi_1.default.string().optional()
}).required();
exports.newDrcOfOwnerSchema = joi_1.default.object({
    querytype: joi_1.default.string().required(),
    application_id: joi_1.default.string().required(),
    owner_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required(),
    drc_certificate_doc_name: joi_1.default.string().required(),
    drc_certificate_doc_path: joi_1.default.string().required(),
    drc_receipt_no: joi_1.default.string().required(),
    drc_file_no: joi_1.default.string().required(),
    isSigned: joi_1.default.string().required(),
    is_digital_sign: joi_1.default.string().required(),
    tdr_value: joi_1.default.string().required(),
    collector_guideline_rate: joi_1.default.number().positive().required(),
    multiplier_factor: joi_1.default.number().positive().required(),
    drc_id: joi_1.default.string().required(),
    drc_certificate_no: joi_1.default.string().required(),
    drc_generation_dt: joi_1.default.date().optional()
}).required();
const objectionSuggestionLandSchema = joi_1.default.object({
    land_id: joi_1.default.number().required(),
    obj_sugg: joi_1.default.string().required(),
    obj_sugg_remark: joi_1.default.string().required(),
    obj_sugg_doc_name: joi_1.default.string().required(),
    obj_sugg_doc_path: joi_1.default.string().required(),
    hearing_remark: joi_1.default.string().required(),
    hearing_doc_name: joi_1.default.string().required(),
    hearing_doc_path: joi_1.default.string().required()
});
const objectionSuggestionPlotSchema = joi_1.default.object({
    plot_id: joi_1.default.number().required(),
    obj_sugg_p: joi_1.default.string().required(),
    obj_sugg_remark_p: joi_1.default.string().required(),
    obj_sugg_doc_name_p: joi_1.default.string().required(),
    obj_sugg_doc_path_p: joi_1.default.string().required(),
    hearing_remark_p: joi_1.default.string().required(),
    hearing_doc_name_p: joi_1.default.string().required(),
    hearing_doc_path_p: joi_1.default.string().required()
});
exports.insertObjectionSuggestionSchema = joi_1.default.object({
    applicationid: joi_1.default.string().required(),
    objectionSuggestionRemark: joi_1.default.string().required(),
    objectionSuggestionLand: joi_1.default.array().items(objectionSuggestionLandSchema).required(),
    objectionSuggestionPlot: joi_1.default.array().items(objectionSuggestionPlotSchema).required(),
    p_rid: joi_1.default.number().required(),
    p_updatedbyuserid: joi_1.default.number().required(),
    p_updatedby_ipaddress: joi_1.default.string().required(),
    p_updatedby_remarks: joi_1.default.string().required(),
    p_updatedbyroleid: joi_1.default.number().required(),
    p_updatedbystatus: joi_1.default.number().required(),
    p_transferto: joi_1.default.number().required(),
    p_submit_status: joi_1.default.string().required()
}).required();
exports.updateOwnerReadyForDrcSchema = joi_1.default.object({
    application_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required(),
    performed_by: joi_1.default.string().required(),
    remarks: joi_1.default.string().optional()
}).required();
const baseDocUploadSchema = joi_1.default.object({
    application_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required(),
    performed_by: joi_1.default.string().required(),
    file_url: joi_1.default.string().required(),
    remarks: joi_1.default.string().optional()
});
exports.uploadForm1Schema = baseDocUploadSchema.required();
exports.uploadForm12Schema = baseDocUploadSchema.required();
exports.uploadForm11Schema = baseDocUploadSchema.keys({
    utilization_id: joi_1.default.string().required(),
    drc_id: joi_1.default.string().required(),
    drc_certificate_no: joi_1.default.string().required(),
    approval_authority: joi_1.default.string().required()
}).required();
exports.uploadForm13Schema = baseDocUploadSchema.keys({
    ledger_snapshot: joi_1.default.number().min(0).optional()
}).required();
exports.uploadLegalLedgerSnapshotSchema = baseDocUploadSchema.keys({
    ledger_snapshot: joi_1.default.number().min(0).required()
}).required();
exports.getLedgerSnapshotSchema = joi_1.default.object({
    application_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required()
}).required();
exports.generateLedgerHashSchema = joi_1.default.object({
    application_id: joi_1.default.string().required(),
    samagra_id: joi_1.default.string().required()
}).required();
exports.tdrFullQuerySchema = joi_1.default.object({
    samagra_id: joi_1.default.string().required()
}).required();
//# sourceMappingURL=tdrValidator.js.map