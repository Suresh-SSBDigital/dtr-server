import { fetchAssetByApplicationId } from './blockchainService';
import { fetchOfficialExternalData, normalizeExternalSourceData } from './externalTdrApiService';
import { generateDeterministicHash } from '../utils/hashGenerator';

type JsonMap = Record<string, unknown>;

export interface ValidateSourceDataResult {
  success: boolean;
  valid: boolean;
  tampered: boolean;
  blockchain_verified: boolean;
  reason?: 'DATA_TAMPERED';
  mismatch_source?: 'EXTERNAL_SYSTEM';
  tampered_fields?: string[];
  validation_timestamp: string;
  txId?: string;
  external_hash: string;
  blockchain_hash: string;
}

function diffFields(path: string, a: unknown, b: unknown, out: string[]): void {
  if (out.length > 50) return;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) out.push(path);
    const size = Math.min(a.length, b.length);
    for (let i = 0; i < size; i += 1) diffFields(`${path}[${i}]`, a[i], b[i], out);
    return;
  }

  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const ao = a as JsonMap;
    const bo = b as JsonMap;
    const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
    for (const key of keys) diffFields(path ? `${path}.${key}` : key, ao[key], bo[key], out);
    return;
  }

  if (a !== b) out.push(path || 'root');
}

function fieldLevelMismatches(source: JsonMap, chainAsset: JsonMap): string[] {
  const out: string[] = [];

  diffFields('owner', source.owner, chainAsset.owner, out);
  diffFields('land', source.land, chainAsset.land, out);
  diffFields('project.status', (source.project as JsonMap)?.status, chainAsset.status, out);

  const util = source.utilization as unknown[];
  if (Array.isArray(util)) {
    const totalUtilized = util.reduce<number>((sum, row) => {
      const value = Number((row as JsonMap)?.utilized_value_tdr ?? (row as JsonMap)?.value_tdr ?? 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    const chainUtilized = Number(chainAsset.utilized_tdr_value ?? 0);
    if (totalUtilized !== chainUtilized) out.push('utilization balance');
  }

  const transfers = source.transfers as unknown[];
  if (Array.isArray(transfers) && transfers.length > 0) {
    const firstTransfer = transfers[0] as JsonMap;
    if (firstTransfer.owner_to && firstTransfer.owner_to !== chainAsset.owner) out.push('transfer owner');
  }

  return [...new Set(out)].slice(0, 50);
}

export async function validateSourceDataAgainstBlockchain(
  application_id: string,
  samagra_id: string
): Promise<ValidateSourceDataResult> {
  const validation_timestamp = new Date().toISOString();
  const externalRaw = await fetchOfficialExternalData(application_id, samagra_id);
  const normalized = normalizeExternalSourceData(externalRaw);
  const external_hash = generateDeterministicHash({
    application_id,
    samagra_id,
    ...normalized
  });

  const assetByApp = await fetchAssetByApplicationId(application_id);
  if (!assetByApp) {
    const err = new Error('Blockchain asset not found for application_id') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  const blockchain_hash = assetByApp.hash;
  const match = external_hash === blockchain_hash;

  console.info('[AUDIT] source-validation', {
    application_id,
    samagra_id,
    validation_timestamp,
    txId: assetByApp.txId,
    external_hash,
    blockchain_hash,
    result: match ? 'MATCH' : 'MISMATCH'
  });

  if (match) {
    return {
      success: true,
      valid: true,
      tampered: false,
      blockchain_verified: true,
      validation_timestamp,
      txId: assetByApp.txId,
      external_hash,
      blockchain_hash
    };
  }

  const tampered_fields = fieldLevelMismatches(normalized as unknown as JsonMap, assetByApp as unknown as JsonMap);
  return {
    success: false,
    valid: false,
    tampered: true,
    blockchain_verified: false,
    reason: 'DATA_TAMPERED',
    mismatch_source: 'EXTERNAL_SYSTEM',
    tampered_fields,
    validation_timestamp,
    txId: assetByApp.txId,
    external_hash,
    blockchain_hash
  };
}
