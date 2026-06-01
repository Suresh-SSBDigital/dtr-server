"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLedgerEntry = void 0;
const buildLedgerEntry = (input) => ({
    action: input.action,
    document_type: input.document_type,
    performed_by: input.performed_by,
    previous_status: input.previous_status,
    new_status: input.new_status,
    remarks: input.remarks,
    txId: input.txId,
    hash: input.hash,
    createdAt: new Date()
});
exports.buildLedgerEntry = buildLedgerEntry;
//# sourceMappingURL=ledgerService.js.map