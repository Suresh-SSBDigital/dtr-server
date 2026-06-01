import type { NextFunction, Request, Response } from 'express';
import { validationApiError } from '../utils/apiError';
import { updateDrcSchema } from '../validators/tdrValidator';
import { updateDrcService } from '../services/tdrService';

export const updateDrc = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const form4File = files?.form4?.[0];
    const drcCertificateFile = files?.drc_certificate?.[0];

    const payload = {
      application_id: req.body.application_id,
      samagra_id: req.body.samagra_id,
      drc_id: req.body.drc_id,
      drc_certificate_no: req.body.drc_certificate_no,
      drc_generation_dt: req.body.drc_generation_dt,
      form4: form4File?.path ?? req.body.form4,
      drc_certificate: drcCertificateFile?.path ?? req.body.drc_certificate
    };

    const { error, value } = updateDrcSchema.validate(payload, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      next(validationApiError(error));
      return;
    }

    const result = await updateDrcService(value);
    res.status(200).json({
      success: true,
      application_id: result.application_id,
      txId: result.txId,
      hash: result.hash
    });
  } catch (err) {
    next(err);
  }
};
