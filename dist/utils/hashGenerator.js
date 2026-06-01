"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeterministicHash = generateDeterministicHash;
const crypto_1 = __importDefault(require("crypto"));
function normalizeValue(value) {
    if (Array.isArray(value))
        return value.map((v) => normalizeValue(v));
    if (value && typeof value === 'object') {
        const obj = value;
        const out = {};
        for (const key of Object.keys(obj).sort()) {
            out[key] = normalizeValue(obj[key]);
        }
        return out;
    }
    return value ?? null;
}
function generateDeterministicHash(payload) {
    const normalized = normalizeValue(payload);
    const json = JSON.stringify(normalized);
    return crypto_1.default.createHash('sha256').update(json, 'utf8').digest('hex');
}
//# sourceMappingURL=hashGenerator.js.map