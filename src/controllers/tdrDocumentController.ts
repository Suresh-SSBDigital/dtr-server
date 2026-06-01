import type { NextFunction, Request, Response } from 'express';
import type { ValidationError } from 'joi';
import { validationApiError } from '../utils/apiError';
import {
  generateLedgerHashSchema,
  getLedgerSnapshotSchema,
  uploadForm11Schema,
  uploadForm12Schema,
  uploadForm13Schema,
  uploadForm1Schema,
  uploadLegalLedgerSnapshotSchema
} from '../validators/tdrValidator';
import { generateLedgerHash, getLedgerSnapshot, uploadLifecycleDocument } from '../services/tdrDocumentService';

function validationError(next: NextFunction, joiError: ValidationError): void {
  next(validationApiError(joiError));
}

export const uploadForm1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = uploadForm1Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return validationError(next, error);
    const out = await uploadLifecycleDocument({ ...value, document_type: 'form1' });
    res.status(200).json({ success: true, ...out });
  } catch (err) {
    next(err);
  }
};

export const uploadForm11 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = uploadForm11Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return validationError(next, error);
    const out = await uploadLifecycleDocument({ ...value, document_type: 'form11' });
    res.status(200).json({ success: true, ...out });
  } catch (err) {
    next(err);
  }
};

export const uploadForm12 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = uploadForm12Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return validationError(next, error);
    const out = await uploadLifecycleDocument({ ...value, document_type: 'form12' });
    res.status(200).json({ success: true, ...out });
  } catch (err) {
    next(err);
  }
};

export const uploadForm13 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = uploadForm13Schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return validationError(next, error);
    const out = await uploadLifecycleDocument({ ...value, document_type: 'form13' });
    res.status(200).json({ success: true, ...out });
  } catch (err) {
    next(err);
  }
};

export const uploadLegalLedgerSnapshot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = uploadLegalLedgerSnapshotSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return validationError(next, error);
    const out = await uploadLifecycleDocument({ ...value, document_type: 'form13' });
    res.status(200).json({ success: true, ...out });
  } catch (err) {
    next(err);
  }
};

export const getLedgerSnapshotHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = getLedgerSnapshotSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return validationError(next, error);
    const snapshot = await getLedgerSnapshot(value.application_id, value.samagra_id);
    res.status(200).json({
      success: true,
      application_id: value.application_id,
      samagra_id: value.samagra_id,
      snapshot
    });
  } catch (err) {
    next(err);
  }
};

export const generateLedgerHashHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = generateLedgerHashSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return validationError(next, error);
    const out = await generateLedgerHash(value.application_id, value.samagra_id);
    res.status(200).json({
      success: true,
      application_id: value.application_id,
      samagra_id: value.samagra_id,
      hash: out.hash
    });
  } catch (err) {
    next(err);
  }
};

