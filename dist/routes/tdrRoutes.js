"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_1 = __importDefault(require("../middleware/apiKey"));
const tdrCreateController_1 = require("../controllers/tdrCreateController");
const tdrDrcController_1 = require("../controllers/tdrDrcController");
const tdrHistoryController_1 = require("../controllers/tdrHistoryController");
const tdrWorkflowController_1 = require("../controllers/tdrWorkflowController");
const tdrDocumentController_1 = require("../controllers/tdrDocumentController");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(apiKey_1.default);
router.get('/history/applications', tdrHistoryController_1.getApplicationsHistoryList);
router.get('/drc-certificates/all', tdrHistoryController_1.getAllDrcCertificates);
router.get('/drc-certificates', tdrHistoryController_1.getPaginatedDrcCertificates);
router.get('/drc/:drc_id', tdrHistoryController_1.getDrcDetailsById);
router.get('/transfers/all', tdrHistoryController_1.getAllTransfers);
router.get('/utilizations/all', tdrHistoryController_1.getAllUtilizations);
router.get('/rid/:rid/drc-info', tdrHistoryController_1.getAllDrcInfoByRid);
router.get('/rid/:rid/history', tdrHistoryController_1.getAllHistoryByRid);
router.get('/:application_id/blockchain/history', tdrHistoryController_1.getBlockchainHistory);
router.get('/:application_id/full', tdrHistoryController_1.getTdrFullByKeys);
router.post('/create', tdrCreateController_1.createTdr);
router.put('/drc', upload_1.drcUpload.fields([
    { name: 'form4', maxCount: 1 },
    { name: 'drc_certificate', maxCount: 1 }
]), tdrDrcController_1.updateDrc);
router.post('/drc', upload_1.drcUpload.fields([
    { name: 'form4', maxCount: 1 },
    { name: 'drc_certificate', maxCount: 1 }
]), tdrDrcController_1.updateDrc);
router.post('/update-owner-ready-for-drc', tdrWorkflowController_1.updateOwnerReadyForDrc);
router.post('/documents/form1', tdrDocumentController_1.uploadForm1);
router.post('/documents/form11', tdrDocumentController_1.uploadForm11);
router.post('/documents/form12', tdrDocumentController_1.uploadForm12);
router.post('/documents/form13', tdrDocumentController_1.uploadForm13);
router.post('/documents/legal-ledger-snapshot', tdrDocumentController_1.uploadLegalLedgerSnapshot);
router.get('/ledger/snapshot', tdrDocumentController_1.getLedgerSnapshotHandler);
router.get('/ledger/hash', tdrDocumentController_1.generateLedgerHashHandler);
exports.default = router;
//# sourceMappingURL=tdrRoutes.js.map