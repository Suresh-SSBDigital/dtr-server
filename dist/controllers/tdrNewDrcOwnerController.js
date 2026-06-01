"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newDrcOfOwner = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrService_1 = require("../services/tdrService");
const newDrcOfOwner = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.newDrcOfOwnerSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const result = await (0, tdrService_1.newDrcOfOwnerService)(value);
        res.status(200).json({
            success: true,
            message: 'NewDRCOfOwner saved successfully',
            application_id: result.application_id,
            samagra_id: result.samagra_id,
            drc_id: result.drc_id,
            drc_certificate_no: result.drc_certificate_no,
            drc_generation_dt: result.drc_generation_dt,
            txId: result.txId,
            hash: result.hash
        });
    }
    catch (err) {
        next(err);
    }
};
exports.newDrcOfOwner = newDrcOfOwner;
//# sourceMappingURL=tdrNewDrcOwnerController.js.map