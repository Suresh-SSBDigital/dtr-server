"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTamperedDataHistory = exports.getTamperedDataList = void 0;
const tamperDataService_1 = require("../services/tamperDataService");
const getTamperedDataList = async (req, res, next) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 400;
        const data = await (0, tamperDataService_1.buildTamperedDashboard)(Number.isFinite(limit) ? limit : 400);
        res.status(200).json({ success: true, ...data });
    }
    catch (err) {
        next(err);
    }
};
exports.getTamperedDataList = getTamperedDataList;
const getTamperedDataHistory = async (req, res, next) => {
    try {
        const recordId = decodeURIComponent(String(req.params.recordId ?? '')).trim();
        if (!recordId) {
            res.status(400).json({ success: false, error: 'recordId is required' });
            return;
        }
        const data = await (0, tamperDataService_1.getTamperHistoryDetail)(recordId);
        if (!data) {
            res.status(404).json({ success: false, error: 'Application not found for this record id' });
            return;
        }
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getTamperedDataHistory = getTamperedDataHistory;
//# sourceMappingURL=tamperDataController.js.map