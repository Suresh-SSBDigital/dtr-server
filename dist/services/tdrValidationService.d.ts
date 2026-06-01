export interface ValidateSourceDataResult {
    success: boolean;
    valid: boolean;
    tampered: boolean;
    blockchain_verified: boolean;
    reason?: 'DATA_TAMPERED';
    mismatch_source?: 'EXTERNAL_SYSTEM';
    tampered_fields?: string[];
    validation_timestamp: string;
    txId?: string;
    external_hash: string;
    blockchain_hash: string;
}
export declare function validateSourceDataAgainstBlockchain(application_id: string, samagra_id: string): Promise<ValidateSourceDataResult>;
//# sourceMappingURL=tdrValidationService.d.ts.map