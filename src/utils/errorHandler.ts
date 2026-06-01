import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error:', err instanceof Error ? err.stack : err);

  const statusCode = (err as any).statusCode || 500;
  const rawCode = String((err as any).errorCode || (err as any).code || '').toUpperCase();
  const rawMessage = String((err as any).message || '');

  const isEnterpriseCode = /^[A-Z][A-Z0-9_]*$/.test(rawCode);
  let errorCode = isEnterpriseCode ? rawCode : 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred while processing the request.';
  let action = 'Please try again. If the issue persists, contact support.';

  if (
    rawCode === 'DRC_NOT_ELIGIBLE' ||
    rawCode === 'DRC_NOT_READY' ||
    rawMessage.includes('DRC certificate not generated. Transfer/Utilization not allowed')
  ) {
    errorCode = 'DRC_NOT_READY';
    message = 'This application cannot be transferred or utilized because the DRC certificate has not been generated yet.';
    action = 'Please complete DRC generation before proceeding.';
  } else if (
    rawCode === 'INSUFFICIENT_BALANCE' ||
    rawCode === 'INSUFFICIENT_TDR_BALANCE' ||
    rawMessage.includes('Insufficient TDR balance') ||
    rawMessage.includes('Transfer amount exceeds remaining available TDR') ||
    rawMessage.includes('Utilized amount exceeds remaining available TDR')
  ) {
    errorCode = 'INSUFFICIENT_BALANCE';
    message = 'The requested transfer/utilization amount exceeds the available TDR balance.';
    action = 'Please enter a lower amount (or area) and retry.';
  } else if (
    rawCode === 'INSUFFICIENT_AREA' ||
    rawMessage.includes('Transferred area exceeds remaining source area') ||
    rawMessage.includes('Utilized area exceeds remaining available area')
  ) {
    errorCode = 'INSUFFICIENT_AREA';
    message = 'The requested area exceeds the available remaining area for this owner.';
    action = 'Please reduce the area and retry.';
  } else if (
    rawCode === 'INVALID_SOURCE_AREA' ||
    rawMessage.includes('Source owner remaining area is invalid for transfer')
  ) {
    errorCode = 'INVALID_SOURCE_AREA';
    message = 'The source owner has no valid remaining area available for transfer.';
    action = 'Please verify the application area state.';
  } else if (
    rawCode === 'VALUATION_CONFIG_MISSING' ||
    rawMessage.includes('Collector guideline rate is missing') ||
    rawMessage.includes('Multiplier factor is missing')
  ) {
    errorCode = 'VALUATION_CONFIG_MISSING';
    message = 'Collector guideline rate or multiplier factor is missing for this application.';
    action = 'Please set the valuation config on the project/land before retrying.';
  } else if (
    rawCode === 'BLOCKCHAIN_ASSET_MISSING' ||
    rawMessage.includes('Blockchain asset not found for application_id')
  ) {
    errorCode = 'BLOCKCHAIN_ASSET_NOT_FOUND';
    message = 'No blockchain record was found for the provided application.';
    action = 'Please verify the application details.';
  } else if (rawCode === 'BLOCKCHAIN_TAMPERED') {
    errorCode = 'BLOCKCHAIN_DATA_MISMATCH';
    message = 'Blockchain and application data are inconsistent for this request.';
    action = 'Please verify application data and contact an administrator.';
  } else if (rawCode === 'DUPLICATE_DRC') {
    errorCode = 'DUPLICATE_DRC';
    message = 'This DRC certificate is already linked with another application.';
    action = 'Please verify the DRC details before uploading again.';
  } else if (statusCode === 404) {
    errorCode = 'RESOURCE_NOT_FOUND';
    message = 'The requested resource was not found.';
    action = 'Please verify identifiers and try again.';
  } else if (statusCode === 409) {
    errorCode = rawCode || 'CONFLICT';
    message = rawMessage || 'The request conflicts with existing application state.';
    action = 'Please verify current record status and retry.';
  } else if (statusCode === 400 || rawCode === 'VALIDATION_ERROR') {
    errorCode = 'VALIDATION_ERROR';
    message = 'The request data is invalid or incomplete.';
    action = 'Please check required fields and try again.';
  }

  const body: Record<string, unknown> = {
    success: false,
    errorCode,
    message,
    action,
    timestamp: new Date().toISOString()
  };

  const details = (err as { validationDetails?: unknown }).validationDetails;
  if (Array.isArray(details) && details.length > 0) {
    body.details = details;
  }

  res.status(statusCode).json(body);
};

export default errorHandler;
