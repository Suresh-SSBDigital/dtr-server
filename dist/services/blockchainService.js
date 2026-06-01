"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAssetByRid = exports.fetchAssetByApplicationId = exports.fetchBlockchainHistory = exports.fetchAssetHistory = exports.pushUpdateAsset = exports.pushCreateAsset = void 0;
const crypto_1 = __importDefault(require("crypto"));
const tdrAssetContract_1 = require("../blockchain/contracts/tdrAssetContract");
const pushCreateAsset = async (payload) => {
    const txId = `0x${crypto_1.default.randomBytes(16).toString('hex')}`;
    await (0, tdrAssetContract_1.createAsset)({
        application_id: payload.application_id,
        tdrApplicationId: payload.tdrApplicationId,
        rid: payload.rid,
        hash: payload.hash,
        timestamp: new Date().toISOString(),
        remaining_tdr_value: payload.remaining_tdr_value,
        utilized_tdr_value: payload.utilized_tdr_value,
        owner: payload.owner,
        district: payload.district
    });
    return {
        txId,
        success: true
    };
};
exports.pushCreateAsset = pushCreateAsset;
const pushUpdateAsset = async (payload) => {
    const txId = `0x${crypto_1.default.randomBytes(16).toString('hex')}`;
    try {
        await (0, tdrAssetContract_1.updateAsset)({
            application_id: payload.application_id,
            tdrApplicationId: payload.tdrApplicationId,
            rid: payload.rid,
            hash: payload.hash,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const statusCode = error?.statusCode;
        if (statusCode === 404) {
            error.code = 'BLOCKCHAIN_ASSET_NOT_FOUND';
        }
        // Self-heal for simulator mode: if blockchain map is empty after restart,
        // seed the asset on first update using current payload.
        if (statusCode === 404) {
            await (0, tdrAssetContract_1.createAsset)({
                application_id: payload.application_id,
                tdrApplicationId: payload.tdrApplicationId,
                rid: payload.rid,
                hash: payload.hash,
                timestamp: new Date().toISOString()
            });
        }
        else {
            throw error;
        }
    }
    return {
        txId,
        success: true
    };
};
exports.pushUpdateAsset = pushUpdateAsset;
const fetchAssetHistory = async (application_id) => {
    return (0, tdrAssetContract_1.getAssetHistory)(application_id);
};
exports.fetchAssetHistory = fetchAssetHistory;
/** Same ledger as `fetchAssetHistory`; maps to chaincode method `getHistory`. */
const fetchBlockchainHistory = async (application_id) => (0, tdrAssetContract_1.getHistory)(application_id);
exports.fetchBlockchainHistory = fetchBlockchainHistory;
const fetchAssetByApplicationId = async (application_id) => (0, tdrAssetContract_1.getAsset)(application_id);
exports.fetchAssetByApplicationId = fetchAssetByApplicationId;
const fetchAssetByRid = async (rid) => (0, tdrAssetContract_1.getAssetByRid)(rid);
exports.fetchAssetByRid = fetchAssetByRid;
//# sourceMappingURL=blockchainService.js.map