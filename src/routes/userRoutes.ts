import { Router } from 'express';
import apiKeyMiddleware from '../middleware/apiKey';
import { insertTransferRequest } from '../controllers/tdrTransferController';
import { insertUtilizationRequest } from '../controllers/tdrUtilizationController';
import { newDrcOfOwner } from '../controllers/tdrNewDrcOwnerController';

const router = Router();
router.use(apiKeyMiddleware);

router.post('/InsertTransferRequest', insertTransferRequest);
router.post('/InsertUtilizationRequest', insertUtilizationRequest);
router.post('/NewDRCOfOwner', newDrcOfOwner);

export default router;
