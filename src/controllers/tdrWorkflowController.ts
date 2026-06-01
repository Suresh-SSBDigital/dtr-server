import type { Request, Response, NextFunction } from 'express';
import { validationApiError } from '../utils/apiError';
import { updateOwnerReadyForDrcSchema } from '../validators/tdrValidator';
import { updateOwnerReadyForDrcService } from '../services/tdrService';

export const updateOwnerReadyForDrc = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = updateOwnerReadyForDrcSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      next(validationApiError(error));
      return;
    }

    const result = await updateOwnerReadyForDrcService(value);
    res.status(200).json({
      success: true,
      application_id: result.application_id,
      samagra_id: result.samagra_id,
      status: 'READY_FOR_DRC',
      txId: result.txId,
      hash: result.hash
    });
  } catch (err) {
    next(err);
  }
};

