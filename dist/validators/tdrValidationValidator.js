"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSourceDataSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.validateSourceDataSchema = joi_1.default.object({
    application_id: joi_1.default.string().trim().required(),
    samagra_id: joi_1.default.string().trim().required()
}).required();
//# sourceMappingURL=tdrValidationValidator.js.map