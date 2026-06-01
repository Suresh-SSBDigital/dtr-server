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

export function createApiError(
  statusCode: number,
  errorCode: string,
  message: string,
  action: string
): ApiErrorShape {
  const err = new Error(message) as ApiErrorShape;
  err.statusCode = statusCode;
  err.errorCode = errorCode;
  err.action = action;
  return err;
}

export function validationApiError(joiError?: ValidationError | null): ApiErrorShape {
  const err = createApiError(
    400,
    'VALIDATION_ERROR',
    'The request data is invalid or incomplete.',
    'Please check required fields and try again.'
  ) as ApiErrorShape;

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
