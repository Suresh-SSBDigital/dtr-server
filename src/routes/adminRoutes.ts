import { Router } from 'express';
import apiKeyMiddleware from '../middleware/apiKey';
import ApiKeyService from '../services/apiKeyService';

const router = Router();
router.use(apiKeyMiddleware);

router.post('/api-keys', async (req, res) => {
  try {
    const { agency, description } = req.body;

    if (!agency) {
      return res.status(400).json({ error: 'Agency name is required' });
    }

    const validAgencies = ['TDR', 'SAMPADA', 'SAMAGRA', 'INTERNAL', 'OTHER'];
    if (!validAgencies.includes(agency)) {
      return res.status(400).json({
        error: `Invalid agency. Must be one of: ${validAgencies.join(', ')}`
      });
    }

    const result = await ApiKeyService.createApiKey({
      agency,
      description: description || `API key for ${agency}`
    });

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: {
        key: result.key,
        id: result.id,
        agency,
        description: description || `API key for ${agency}`
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

router.get('/api-keys', async (req, res) => {
  try {
    const keys = await ApiKeyService.listApiKeys();
    res.json({
      success: true,
      count: keys.length,
      data: keys
    });
  } catch (error) {
    console.error('Error listing API keys:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Failed to list API keys' });
  }
});

router.delete('/api-keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ApiKeyService.deactivateKey(id);

    if (!result) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      success: true,
      message: 'API key deactivated successfully',
      data: {
        id: result._id,
        agency: result.agency,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error deactivating API key:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Failed to deactivate API key' });
  }
});

export default router;
