"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertTdrTrackingKeysMatch = assertTdrTrackingKeysMatch;
/**
 * Ensures client-supplied tracking keys match the Mongo TDR row (Samagra + RID + external IDs).
 */
function assertTdrTrackingKeysMatch(tdr, expected) {
    const mismatches = [];
    const dbApp = String(tdr.application_id ?? '').trim();
    const dbSam = String(tdr.owner?.samagra_id ?? '').trim();
    const dbRid = String(tdr.rid ?? '').trim();
    const dbExt = String(tdr.tdrApplicationId ?? '').trim();
    if (dbApp !== String(expected.application_id).trim()) {
        mismatches.push(`application_id mismatch (db=${dbApp})`);
    }
    if (dbSam !== String(expected.samagra_id).trim()) {
        mismatches.push(`samagra_id mismatch`);
    }
    if (dbRid !== String(expected.rid).trim()) {
        mismatches.push(`rid mismatch (expected client rid to match TDR.rid)`);
    }
    if (dbExt !== String(expected.tdrApplicationId).trim()) {
        mismatches.push(`tdrApplicationId mismatch`);
    }
    if (mismatches.length > 0) {
        const err = new Error(`Tracking keys do not match this TDR record: ${mismatches.join('; ')}`);
        err.statusCode = 400;
        err.code = 'TRACKING_KEY_MISMATCH';
        throw err;
    }
}
//# sourceMappingURL=trackingKeys.js.map