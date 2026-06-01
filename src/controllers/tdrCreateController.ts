import type { Request, Response, NextFunction } from 'express';
import { createTdrSchema } from '../validators/tdrValidator';
import { createTdrApplication } from '../services/tdrService';
import { validationApiError } from '../utils/apiError';

export const createTdr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = createTdrSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      next(validationApiError(error));
      return;
    }

    const result = await createTdrApplication(value);

    res.status(201).json({
      success: true,
      application_id: result.application_id,
      tdrApplicationId: result.tdrApplicationId,
      samagra_id: result.samagra_id,
      rid: result.rid,
      txId: result.txId,
      hash: result.hash
    });
  } catch (err) {
    next(err);
  }
};
