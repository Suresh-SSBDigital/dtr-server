import { Router } from 'express';
import apiKeyMiddleware from '../middleware/apiKey';
import { createTdr } from '../controllers/tdrCreateController';
import { updateDrc } from '../controllers/tdrDrcController';
import {
  getAllDrcCertificates,
  getPaginatedDrcCertificates,
  getAllDrcInfoByRid,
  getAllHistoryByRid,
  getDrcDetailsById,
  getAllTransfers,
  getAllUtilizations,
  getApplicationsHistoryList,
  getBlockchainHistory,
  getTdrFullByKeys
} from '../controllers/tdrHistoryController';
import { updateOwnerReadyForDrc } from '../controllers/tdrWorkflowController';
import {
  generateLedgerHashHandler,
  getLedgerSnapshotHandler,
  uploadForm1,
  uploadForm11,
  uploadForm12,
  uploadForm13,
  uploadLegalLedgerSnapshot
} from '../controllers/tdrDocumentController';
import { drcUpload } from '../middleware/upload';

const router = Router();
router.use(apiKeyMiddleware);

router.get('/history/applications', getApplicationsHistoryList);
router.get('/drc-certificates/all', getAllDrcCertificates);
router.get('/drc-certificates', getPaginatedDrcCertificates);
router.get('/drc/:drc_id', getDrcDetailsById);
router.get('/transfers/all', getAllTransfers);
router.get('/utilizations/all', getAllUtilizations);
router.get('/rid/:rid/drc-info', getAllDrcInfoByRid);
router.get('/rid/:rid/history', getAllHistoryByRid);
router.get('/:application_id/blockchain/history', getBlockchainHistory);
router.get('/:application_id/full', getTdrFullByKeys);

router.post('/create', createTdr);
router.put(
  '/drc',
  drcUpload.fields([
    { name: 'form4', maxCount: 1 },
    { name: 'drc_certificate', maxCount: 1 }
  ]),
  updateDrc
);
router.post(
  '/drc',
  drcUpload.fields([
    { name: 'form4', maxCount: 1 },
    { name: 'drc_certificate', maxCount: 1 }
  ]),
  updateDrc
);
router.post('/update-owner-ready-for-drc', updateOwnerReadyForDrc);
router.post('/documents/form1', uploadForm1);
router.post('/documents/form11', uploadForm11);
router.post('/documents/form12', uploadForm12);
router.post('/documents/form13', uploadForm13);
router.post('/documents/legal-ledger-snapshot', uploadLegalLedgerSnapshot);
router.get('/ledger/snapshot', getLedgerSnapshotHandler);
router.get('/ledger/hash', generateLedgerHashHandler);

export default router;
