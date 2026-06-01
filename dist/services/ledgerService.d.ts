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
export declare const buildLedgerEntry: (input: LedgerAppendInput) => {
    action: string;
    document_type: string | undefined;
    performed_by: string;
    previous_status: string | undefined;
    new_status: string;
    remarks: string | undefined;
    txId: string;
    hash: string;
    createdAt: Date;
};
//# sourceMappingURL=ledgerService.d.ts.map