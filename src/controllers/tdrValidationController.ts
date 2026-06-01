import type { NextFunction, Request, Response } from 'express';
import { createApiError, validationApiError } from '../utils/apiError';
import { validateSourceDataSchema } from '../validators/tdrValidationValidator';
import { validateSourceDataAgainstBlockchain } from '../services/tdrValidationService';

export const validateSourceData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = validateSourceDataSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      next(validationApiError(error));
      return;
    }

    const result = await validateSourceDataAgainstBlockchain(value.application_id, value.samagra_id);

    if (!result.valid) {
      next(
        createApiError(
          409,
          'DATA_TAMPERED',
          'The source system data does not match the blockchain record.',
          'Please verify source records and reconcile before proceeding.'
        )
      );
      return;
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
