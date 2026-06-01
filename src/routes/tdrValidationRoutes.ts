import { Router } from 'express';
import apiKeyMiddleware from '../middleware/apiKey';
import { validateSourceData } from '../controllers/tdrValidationController';

const router = Router();
router.use(apiKeyMiddleware);

// POST /api/tdr/validate-source-data
router.post('/validate-source-data', validateSourceData);

export default router;
