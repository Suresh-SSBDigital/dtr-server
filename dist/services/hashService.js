"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDataHash = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateDataHash = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const sortedData = JSON.stringify(data, Object.keys(data).sort());
            const hash = crypto_1.default.createHash('sha256');
            hash.update(sortedData, 'utf8');
            resolve(hash.digest('hex'));
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateDataHash = generateDataHash;
//# sourceMappingURL=hashService.js.map