import Joi from 'joi';

const ownerSchema = Joi.object({
  owner_id: Joi.string().optional(),
  owner_type: Joi.string().optional(),
  owner_gender: Joi.string().optional(),
  owner_ekyc: Joi.boolean().optional(),
  is_first_owner: Joi.boolean().optional(),
  name: Joi.string().required(),
  dob: Joi.string().optional(),
  samagra_id: Joi.string().required(),
  mobile: Joi.string().optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().optional(),
  owner_name_hash: Joi.string().optional(),
  owner_mobile_hash: Joi.string().optional()
}).required();

const projectSchema = Joi.object({
  project_name: Joi.string().required(),
  implement_agency: Joi.string().optional(),
  district: Joi.string().optional(),
  tehsil: Joi.string().optional(),
  village: Joi.string().optional(),
  project_stage: Joi.string().optional(),
  govt_order_no: Joi.string().optional(),
  govt_order_dt: Joi.date().optional(),
  drc_certificate_no: Joi.string().optional(),
  drc_generation_dt: Joi.date().optional(),
  status: Joi.string().default('CREATED')
}).required();

const landSchema = Joi.object({
  land_id: Joi.string().optional(),
  khasra_no: Joi.string().required(),
  total_area: Joi.number().required(),
  proposed_area: Joi.number().optional(),
  value_tdr: Joi.number().optional()
}).required();

const plotSchema = Joi.object({
  plot_id: Joi.string().optional(),
  plot_no: Joi.string().optional(),
  registry_area: Joi.number().optional(),
  proposed_area: Joi.number().optional(),
  ownership: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional()
});

const documentsSchema = Joi.object({
  form1: Joi.string().optional(),
  form4: Joi.string().optional(),
  drc_certificate: Joi.string().optional()
}).default({});

export const createTdrSchema = Joi.object({
  tdrApplicationId: Joi.string().required(),
  rid: Joi.string().required(),
  owner: ownerSchema,
  project: projectSchema,
  land: landSchema,
  plots: Joi.array().items(plotSchema).default([]),
  documents: documentsSchema
}).required();

export const updateDrcSchema = Joi.object({
  application_id: Joi.string().required(),
  samagra_id: Joi.string().required(),
  drc_id: Joi.string().required(),
  drc_certificate_no: Joi.string().required(),
  drc_generation_dt: Joi.date().required(),
  form4: Joi.string().required(),
  drc_certificate: Joi.string().required()
}).required();

/** Optional; when omitted, transferee owner is derived from `owner_to` + parent owner defaults. */
const transfereeOwnerSchema = Joi.object({
  owner_id: Joi.string().optional(),
  owner_type: Joi.string().optional(),
  owner_gender: Joi.string().optional(),
  gender: Joi.string().optional(),
  owner_ekyc: Joi.boolean().optional(),
  is_first_owner: Joi.boolean().optional(),
  owner_name: Joi.string().optional(),
  name: Joi.string().optional(),
  dob: Joi.string().optional(),
  samagra_id: Joi.string().required(),
  mobile: Joi.string().optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().optional(),
  owner_name_hash: Joi.string().optional(),
  owner_mobile_hash: Joi.string().optional()
})
  .or('owner_name', 'name')
  .required();

export const insertTransferSchema = Joi.object({
  application_id: Joi.string().required(),
  samagra_id: Joi.string().required(),
  trn_id: Joi.string().required(),
  owner_from: Joi.string().required(),
  owner_to: Joi.string().optional(),
  trn_value_tdr: Joi.number().positive().optional(),
  transferred_area: Joi.number().positive().required(),
  trn_date: Joi.date().required(),
  status: Joi.string().required(),
  transferee_owner: transfereeOwnerSchema
}).required();

export const insertUtilizationSchema = Joi.object({
  application_id: Joi.string().required(),
  samagra_id: Joi.string().required(),
  utilization_id: Joi.string().required(),
  drc_id: Joi.string().required(),
  drc_certificate_no: Joi.string().required(),
  utilized_by: Joi.string().required(),
  utilized_value_tdr: Joi.number().positive().optional(),
  utilized_area: Joi.number().positive().required(),
  utilization_purpose: Joi.string().required(),
  utilization_date: Joi.date().required(),
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED').required(),
  remarks: Joi.string().optional()
}).required();

export const newDrcOfOwnerSchema = Joi.object({
  querytype: Joi.string().required(),
  application_id: Joi.string().required(),
  owner_id: Joi.string().required(),
  samagra_id: Joi.string().required(),
  drc_certificate_doc_name: Joi.string().required(),
  drc_certificate_doc_path: Joi.string().required(),
  drc_receipt_no: Joi.string().required(),
  drc_file_no: Joi.string().required(),
  isSigned: Joi.string().required(),
  is_digital_sign: Joi.string().required(),
  tdr_value: Joi.string().required(),
  collector_guideline_rate: Joi.number().positive().required(),
  multiplier_factor: Joi.number().positive().required(),
  drc_id: Joi.string().required(),
  drc_certificate_no: Joi.string().required(),
  drc_generation_dt: Joi.date().optional()
}).required();

const objectionSuggestionLandSchema = Joi.object({
  land_id: Joi.number().required(),
  obj_sugg: Joi.string().required(),
  obj_sugg_remark: Joi.string().required(),
  obj_sugg_doc_name: Joi.string().required(),
  obj_sugg_doc_path: Joi.string().required(),
  hearing_remark: Joi.string().required(),
  hearing_doc_name: Joi.string().required(),
  hearing_doc_path: Joi.string().required()
});

const objectionSuggestionPlotSchema = Joi.object({
  plot_id: Joi.number().required(),
  obj_sugg_p: Joi.string().required(),
  obj_sugg_remark_p: Joi.string().required(),
  obj_sugg_doc_name_p: Joi.string().required(),
  obj_sugg_doc_path_p: Joi.string().required(),
  hearing_remark_p: Joi.string().required(),
  hearing_doc_name_p: Joi.string().required(),
  hearing_doc_path_p: Joi.string().required()
});

export const insertObjectionSuggestionSchema = Joi.object({
  applicationid: Joi.string().required(),
  objectionSuggestionRemark: Joi.string().required(),
  objectionSuggestionLand: Joi.array().items(objectionSuggestionLandSchema).required(),
  objectionSuggestionPlot: Joi.array().items(objectionSuggestionPlotSchema).required(),
  p_rid: Joi.number().required(),
  p_updatedbyuserid: Joi.number().required(),
  p_updatedby_ipaddress: Joi.string().required(),
  p_updatedby_remarks: Joi.string().required(),
  p_updatedbyroleid: Joi.number().required(),
  p_updatedbystatus: Joi.number().required(),
  p_transferto: Joi.number().required(),
  p_submit_status: Joi.string().required()
}).required();

export const updateOwnerReadyForDrcSchema = Joi.object({
  application_id: Joi.string().required(),
  samagra_id: Joi.string().required(),
  performed_by: Joi.string().required(),
  remarks: Joi.string().optional()
}).required();

const baseDocUploadSchema = Joi.object({
  application_id: Joi.string().required(),
  samagra_id: Joi.string().required(),
  performed_by: Joi.string().required(),
  file_url: Joi.string().required(),
  remarks: Joi.string().optional()
});

export const uploadForm1Schema = baseDocUploadSchema.required();
export const uploadForm12Schema = baseDocUploadSchema.required();
export const uploadForm11Schema = baseDocUploadSchema.keys({
  utilization_id: Joi.string().required(),
  drc_id: Joi.string().required(),
  drc_certificate_no: Joi.string().required(),
  approval_authority: Joi.string().required()
}).required();
export const uploadForm13Schema = baseDocUploadSchema.keys({
  ledger_snapshot: Joi.number().min(0).optional()
}).required();
export const uploadLegalLedgerSnapshotSchema = baseDocUploadSchema.keys({
  ledger_snapshot: Joi.number().min(0).required()
}).required();

export const getLedgerSnapshotSchema = Joi.object({
  application_id: Joi.string().required(),
  samagra_id: Joi.string().required()
}).required();

export const generateLedgerHashSchema = Joi.object({
  application_id: Joi.string().required(),
  samagra_id: Joi.string().required()
}).required();

export const tdrFullQuerySchema = Joi.object({
  samagra_id: Joi.string().required()
}).required();
