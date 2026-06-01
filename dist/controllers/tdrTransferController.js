"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTransferRequest = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrService_1 = require("../services/tdrService");
const insertTransferRequest = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.insertTransferSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const result = await (0, tdrService_1.insertTransferRequestService)(value);
        const totalArea = result.old_owner_remaining_area +
            result.transferred_area;
        res.status(200).json({
            success: true,
            application_id: result.application_id,
            txId: result.txId,
            hash: result.hash,
            summary: {
                total_tdr_value: result.old_total_tdr,
                transferred_tdr_value: result.transferred_tdr_value,
                remaining_tdr_value: result.remaining_value_tdr,
                total_area: result.old_total_area,
                // fixed original/proposed area
                proposed_area: result.old_total_area,
                transferred_area: result.transferred_area,
                remaining_area: result.old_owner_remaining_area,
                collector_guideline_rate: result.collector_guideline_rate,
                multiplier_factor: result.multiplier_factor,
                generated_tdr_value: result.generated_tdr_value
            },
            source: {
                application_id: result.source_application_id,
                owner: result.transferred_from_owner,
                remaining_area: result.old_owner_remaining_area,
                remaining_tdr: result.old_owner_remaining_tdr
            },
            recipient: {
                application_id: result.recipient_application_id,
                tdrApplicationId: result.recipient_tdrApplicationId,
                rid: result.recipient_rid,
                asset_txId: result.recipient_asset_txId
            },
            transfer_txId: result.transfer_txId
        });
    }
    catch (err) {
        next(err);
    }
};
exports.insertTransferRequest = insertTransferRequest;
//# sourceMappingURL=tdrTransferController.js.map