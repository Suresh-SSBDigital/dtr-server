"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const schema = new mongoose_1.Schema({
    application_id: { type: String, required: true, unique: true, index: true },
    tdrApplicationId: { type: String, required: true, unique: true, index: true },
    /** Shared across transfer source/recipient rows; not globally unique. Indexed for lookup by RID. */
    rid: { type: String, required: true, index: true },
    source_application_id: { type: String, index: true },
    source_rid: { type: String },
    transferred_from_owner: { type: String },
    transfer_txId: { type: String },
    owner: { type: mongoose_1.Schema.Types.Mixed, required: true },
    project: { type: mongoose_1.Schema.Types.Mixed, required: true },
    land: { type: mongoose_1.Schema.Types.Mixed, required: true },
    total_tdr_value: { type: Number },
    utilized_tdr_value: { type: Number, default: 0 },
    remaining_tdr_value: { type: Number },
    plots: [{ type: mongoose_1.Schema.Types.Mixed }],
    transfers: [{ type: mongoose_1.Schema.Types.Mixed }],
    utilizations: [{ type: mongoose_1.Schema.Types.Mixed }],
    new_drc_of_owner: [{ type: mongoose_1.Schema.Types.Mixed }],
    objection_suggestions: [{ type: mongoose_1.Schema.Types.Mixed }],
    ledger: [{ type: mongoose_1.Schema.Types.Mixed }],
    documents: { type: mongoose_1.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
// Sparse indexes on DRC fields — speed up the $or filter used by the
// certificates list. 'sparse: true' means only documents where the field
// exists are indexed, keeping the index small.
schema.index({ 'project.drc_certificate_no': 1 }, { sparse: true });
schema.index({ 'project.drc_id': 1 }, { sparse: true });
schema.index({ 'documents.drc_certificate': 1 }, { sparse: true });
// Compound index for the common list sort (certificates sorted by updatedAt).
schema.index({ 'project.drc_id': 1, updatedAt: -1 }, { sparse: true });
exports.default = mongoose_1.default.model('TDR', schema);
//# sourceMappingURL=tdr.js.map