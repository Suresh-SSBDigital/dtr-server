"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUtilizationRequest = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrService_1 = require("../services/tdrService");
const insertUtilizationRequest = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.insertUtilizationSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const result = await (0, tdrService_1.insertUtilizationRequestService)(value);
        res.status(200).json({
            success: true,
            message: 'TDR utilized successfully',
            txId: result.txId,
            hash: result.hash,
            utilization_id: result.utilization_id,
            old_total_tdr: result.old_total_tdr,
            remaining_tdr_value: result.remaining_tdr_value,
            utilized_tdr_value: result.utilized_tdr_value,
            old_total_area: result.old_total_area,
            remaining_area: result.remaining_area,
            utilized_area: result.utilized_area
        });
    }
    catch (err) {
        next(err);
    }
};
exports.insertUtilizationRequest = insertUtilizationRequest;
//# sourceMappingURL=tdrUtilizationController.js.map