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
const tdrEntityActionHistorySchema = new mongoose_1.Schema({
    samagra_id: { type: String, required: true, index: true },
    rid: { type: String, required: true, index: true },
    application_id: { type: String, required: true, index: true },
    tdrApplicationId: { type: String, required: true, index: true },
    http_method: {
        type: String,
        required: true,
        enum: ['POST', 'PUT', 'PATCH', 'DELETE']
    },
    action: { type: String, required: true, index: true },
    route_key: { type: String, required: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed }
}, { timestamps: true });
tdrEntityActionHistorySchema.index({ samagra_id: 1, createdAt: -1 });
tdrEntityActionHistorySchema.index({ application_id: 1, createdAt: -1 });
tdrEntityActionHistorySchema.index({ rid: 1, createdAt: -1 });
tdrEntityActionHistorySchema.index({ tdrApplicationId: 1, createdAt: -1 });
const TdrEntityActionHistory = mongoose_1.default.model('TdrEntityActionHistory', tdrEntityActionHistorySchema);
exports.default = TdrEntityActionHistory;
//# sourceMappingURL=tdrEntityActionHistory.js.map