"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLedgerHashHandler = exports.getLedgerSnapshotHandler = exports.uploadLegalLedgerSnapshot = exports.uploadForm13 = exports.uploadForm12 = exports.uploadForm11 = exports.uploadForm1 = void 0;
const apiError_1 = require("../utils/apiError");
const tdrValidator_1 = require("../validators/tdrValidator");
const tdrDocumentService_1 = require("../services/tdrDocumentService");
function validationError(next, joiError) {
    next((0, apiError_1.validationApiError)(joiError));
}
const uploadForm1 = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.uploadForm1Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error)
            return validationError(next, error);
        const out = await (0, tdrDocumentService_1.uploadLifecycleDocument)({ ...value, document_type: 'form1' });
        res.status(200).json({ success: true, ...out });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadForm1 = uploadForm1;
const uploadForm11 = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.uploadForm11Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error)
            return validationError(next, error);
        const out = await (0, tdrDocumentService_1.uploadLifecycleDocument)({ ...value, document_type: 'form11' });
        res.status(200).json({ success: true, ...out });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadForm11 = uploadForm11;
const uploadForm12 = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.uploadForm12Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error)
            return validationError(next, error);
        const out = await (0, tdrDocumentService_1.uploadLifecycleDocument)({ ...value, document_type: 'form12' });
        res.status(200).json({ success: true, ...out });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadForm12 = uploadForm12;
const uploadForm13 = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.uploadForm13Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error)
            return validationError(next, error);
        const out = await (0, tdrDocumentService_1.uploadLifecycleDocument)({ ...value, document_type: 'form13' });
        res.status(200).json({ success: true, ...out });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadForm13 = uploadForm13;
const uploadLegalLedgerSnapshot = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.uploadLegalLedgerSnapshotSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error)
            return validationError(next, error);
        const out = await (0, tdrDocumentService_1.uploadLifecycleDocument)({ ...value, document_type: 'form13' });
        res.status(200).json({ success: true, ...out });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadLegalLedgerSnapshot = uploadLegalLedgerSnapshot;
const getLedgerSnapshotHandler = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.getLedgerSnapshotSchema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error)
            return validationError(next, error);
        const snapshot = await (0, tdrDocumentService_1.getLedgerSnapshot)(value.application_id, value.samagra_id);
        res.status(200).json({
            success: true,
            application_id: value.application_id,
            samagra_id: value.samagra_id,
            snapshot
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getLedgerSnapshotHandler = getLedgerSnapshotHandler;
const generateLedgerHashHandler = async (req, res, next) => {
    try {
        const { error, value } = tdrValidator_1.generateLedgerHashSchema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error)
            return validationError(next, error);
        const out = await (0, tdrDocumentService_1.generateLedgerHash)(value.application_id, value.samagra_id);
        res.status(200).json({
            success: true,
            application_id: value.application_id,
            samagra_id: value.samagra_id,
            hash: out.hash
        });
    }
    catch (err) {
        next(err);
    }
};
exports.generateLedgerHashHandler = generateLedgerHashHandler;
//# sourceMappingURL=tdrDocumentController.js.map