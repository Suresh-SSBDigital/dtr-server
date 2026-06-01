"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnerReadyForDrc = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrService_1 = require("../services/tdrService");
const updateOwnerReadyForDrc = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.updateOwnerReadyForDrcSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const result = await (0, tdrService_1.updateOwnerReadyForDrcService)(value);
        res.status(200).json({
            success: true,
            application_id: result.application_id,
            samagra_id: result.samagra_id,
            status: 'READY_FOR_DRC',
            txId: result.txId,
            hash: result.hash
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateOwnerReadyForDrc = updateOwnerReadyForDrc;
//# sourceMappingURL=tdrWorkflowController.js.map