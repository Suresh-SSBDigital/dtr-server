import { Router } from 'express';
import apiKeyMiddleware from '../middleware/apiKey';
import { insertObjectionSuggestion } from '../controllers/agencyController';

const router = Router();
router.use(apiKeyMiddleware);

router.post('/InsertObjectionSuggestion', insertObjectionSuggestion);

export default router;
