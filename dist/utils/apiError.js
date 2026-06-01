"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiError = createApiError;
exports.validationApiError = validationApiError;
function createApiError(statusCode, errorCode, message, action) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.errorCode = errorCode;
    err.action = action;
    return err;
}
function validationApiError(joiError) {
    const err = createApiError(400, 'VALIDATION_ERROR', 'The request data is invalid or incomplete.', 'Please check required fields and try again.');
    if (joiError?.details?.length) {
        err.validationDetails = joiError.details.map((d) => ({
            path: d.path.length ? d.path.join('.') : '(root)',
            message: d.message,
            type: d.type
        }));
        console.error('[VALIDATION]', JSON.stringify(err.validationDetails, null, 2));
    }
    return err;
}
//# sourceMappingURL=apiError.js.map