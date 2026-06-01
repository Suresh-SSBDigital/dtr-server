import type { ValidationError } from 'joi';
export interface ValidationDetailItem {
    path: string;
    message: string;
    type?: string;
}
export interface ApiErrorShape extends Error {
    statusCode?: number;
    errorCode?: string;
    action?: string;
    validationDetails?: ValidationDetailItem[];
}
export declare function createApiError(statusCode: number, errorCode: string, message: string, action: string): ApiErrorShape;
export declare function validationApiError(joiError?: ValidationError | null): ApiErrorShape;
//# sourceMappingURL=apiError.d.ts.map