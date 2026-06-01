import type { Request, Response, NextFunction } from 'express';
interface AgencyInfo {
    agency: string;
    status: string;
    keyId: string;
    usage_count: number;
}
interface RequestWithAgency extends Request {
    agency?: AgencyInfo;
}
declare const apiKeyMiddleware: (req: RequestWithAgency, res: Response, next: NextFunction) => Promise<void>;
export default apiKeyMiddleware;
//# sourceMappingURL=apiKey.d.ts.map