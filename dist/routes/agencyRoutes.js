"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_1 = __importDefault(require("../middleware/apiKey"));
const agencyController_1 = require("../controllers/agencyController");
const router = (0, express_1.Router)();
router.use(apiKey_1.default);
router.post('/InsertObjectionSuggestion', agencyController_1.insertObjectionSuggestion);
exports.default = router;
//# sourceMappingURL=agencyRoutes.js.map