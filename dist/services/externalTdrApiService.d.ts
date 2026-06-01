type JsonMap = Record<string, unknown>;
export interface ExternalSourceBundle {
    agencyApplication: JsonMap;
    ownerDetail: JsonMap;
    applicationStatus: JsonMap;
    form6Ledger: JsonMap;
    drcList: JsonMap;
}
export interface NormalizedExternalTdrData {
    owner: JsonMap;
    project: JsonMap;
    land: JsonMap;
    drc: JsonMap;
    transfers: unknown[];
    utilization: unknown[];
    ledger: unknown[];
    documents: JsonMap;
}
export declare function fetchOfficialExternalData(application_id: string, samagra_id: string): Promise<ExternalSourceBundle>;
export declare function normalizeExternalSourceData(raw: ExternalSourceBundle): NormalizedExternalTdrData;
export {};
//# sourceMappingURL=externalTdrApiService.d.ts.map