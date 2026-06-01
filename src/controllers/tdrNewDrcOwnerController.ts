import type { NextFunction, Request, Response } from 'express';
import { validationApiError } from '../utils/apiError';
import { newDrcOfOwnerSchema } from '../validators/tdrValidator';
import { newDrcOfOwnerService } from '../services/tdrService';

export const newDrcOfOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = newDrcOfOwnerSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      next(validationApiError(error));
      return;
    }

    const result = await newDrcOfOwnerService(value);
    res.status(200).json({
      success: true,
      message: 'NewDRCOfOwner saved successfully',
      application_id: result.application_id,
      samagra_id: result.samagra_id,
      drc_id: result.drc_id,
      drc_certificate_no: result.drc_certificate_no,
      drc_generation_dt: result.drc_generation_dt,
      txId: result.txId,
      hash: result.hash
    });
  } catch (err) {
    next(err);
  }
};
