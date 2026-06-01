"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDrc = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrService_1 = require("../services/tdrService");
const updateDrc = async (req, res, next) => {
    try {
        const files = req.files;
        const form4File = files?.form4?.[0];
        const drcCertificateFile = files?.drc_certificate?.[0];
        const payload = {
            application_id: req.body.application_id,
            samagra_id: req.body.samagra_id,
            drc_id: req.body.drc_id,
            drc_certificate_no: req.body.drc_certificate_no,
            drc_generation_dt: req.body.drc_generation_dt,
            form4: form4File?.path ?? req.body.form4,
            drc_certificate: drcCertificateFile?.path ?? req.body.drc_certificate
        };
        const { error, value } = tdrValidator_1.updateDrcSchema.validate(payload, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            next((0, apiError_1.validationApiError)(error));
            return;
        }
        const result = await (0, tdrService_1.updateDrcService)(value);
        res.status(200).json({
            success: true,
            application_id: result.application_id,
            txId: result.txId,
            hash: result.hash
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateDrc = updateDrc;
//# sourceMappingURL=tdrDrcController.js.map