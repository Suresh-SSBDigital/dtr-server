import type { NextFunction, Request, Response } from 'express';
import { validationApiError } from '../utils/apiError';
import { insertObjectionSuggestionSchema } from '../validators/tdrValidator';
import { insertObjectionSuggestionService } from '../services/tdrService';

export const insertObjectionSuggestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = insertObjectionSuggestionSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      next(validationApiError(error));
      return;
    }

    const out = await insertObjectionSuggestionService(value);
    res.status(200).json({
      success: true,
      txId: out.txId,
      hash: out.hash,
      application_id: out.application_id
    });
  } catch (err) {
    next(err);
  }
};
