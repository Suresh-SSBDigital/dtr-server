export interface LedgerAppendInput {
  action: string;
  document_type?: string;
  performed_by: string;
  previous_status?: string;
  new_status: string;
  remarks?: string;
  txId: string;
  hash: string;
}

export const buildLedgerEntry = (input: LedgerAppendInput) => ({
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

