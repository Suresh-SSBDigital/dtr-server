import type { Request, Response, NextFunction } from 'express';
import { validationApiError } from '../utils/apiError';
import { insertUtilizationSchema } from '../validators/tdrValidator';
import { insertUtilizationRequestService } from '../services/tdrService';

export const insertUtilizationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = insertUtilizationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      next(validationApiError(error));
      return;
    }

    const result = await insertUtilizationRequestService(value);

    res.status(200).json({
      success: true,
      message: 'TDR utilized successfully',
      txId: result.txId,
      hash: result.hash,
      utilization_id: result.utilization_id,
      old_total_tdr: result.old_total_tdr,
      remaining_tdr_value: result.remaining_tdr_value,
      utilized_tdr_value: result.utilized_tdr_value,
      old_total_area: result.old_total_area,
      remaining_area: result.remaining_area,
      utilized_area: result.utilized_area
    });
  } catch (err) {
    next(err);
  }
};

