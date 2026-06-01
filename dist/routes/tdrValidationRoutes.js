"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_1 = __importDefault(require("../middleware/apiKey"));
const tdrValidationController_1 = require("../controllers/tdrValidationController");
const router = (0, express_1.Router)();
router.use(apiKey_1.default);
// POST /api/tdr/validate-source-data
router.post('/validate-source-data', tdrValidationController_1.validateSourceData);
exports.default = router;
//# sourceMappingURL=tdrValidationRoutes.js.map