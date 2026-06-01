"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSourceData = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidationValidator_1 = require("../validators/tdrValidationValidator");
const tdrValidationService_1 = require("../services/tdrValidationService");
const validateSourceData = async (req, res, next) => {
    try {
        const { error, value } = tdrValidationValidator_1.validateSourceDataSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const result = await (0, tdrValidationService_1.validateSourceDataAgainstBlockchain)(value.application_id, value.samagra_id);
        if (!result.valid) {
            next((0, apiError_1.createApiError)(409, 'DATA_TAMPERED', 'The source system data does not match the blockchain record.', 'Please verify source records and reconcile before proceeding.'));
            return;
        }
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.validateSourceData = validateSourceData;
//# sourceMappingURL=tdrValidationController.js.map