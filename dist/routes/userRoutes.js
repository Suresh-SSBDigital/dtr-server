"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_1 = __importDefault(require("../middleware/apiKey"));
const tdrTransferController_1 = require("../controllers/tdrTransferController");
const tdrUtilizationController_1 = require("../controllers/tdrUtilizationController");
const tdrNewDrcOwnerController_1 = require("../controllers/tdrNewDrcOwnerController");
const router = (0, express_1.Router)();
router.use(apiKey_1.default);
router.post('/InsertTransferRequest', tdrTransferController_1.insertTransferRequest);
router.post('/InsertUtilizationRequest', tdrUtilizationController_1.insertUtilizationRequest);
router.post('/NewDRCOfOwner', tdrNewDrcOwnerController_1.newDrcOfOwner);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map