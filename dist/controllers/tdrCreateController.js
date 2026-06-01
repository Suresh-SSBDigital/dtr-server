"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTdr = void 0;
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrService_1 = require("../services/tdrService");
const apiError_1 = require("../utils/apiError");
const createTdr = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.createTdrSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const result = await (0, tdrService_1.createTdrApplication)(value);
        res.status(201).json({
            success: true,
            application_id: result.application_id,
            tdrApplicationId: result.tdrApplicationId,
            samagra_id: result.samagra_id,
            rid: result.rid,
            txId: result.txId,
            hash: result.hash
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createTdr = createTdr;
//# sourceMappingURL=tdrCreateController.js.map