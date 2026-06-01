"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertObjectionSuggestion = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrService_1 = require("../services/tdrService");
const insertObjectionSuggestion = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.insertObjectionSuggestionSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const out = await (0, tdrService_1.insertObjectionSuggestionService)(value);
        res.status(200).json({
            success: true,
            txId: out.txId,
            hash: out.hash,
            application_id: out.application_id
        });
    }
    catch (err) {
        next(err);
    }
};
exports.insertObjectionSuggestion = insertObjectionSuggestion;
//# sourceMappingURL=agencyController.js.map