import crypto from 'crypto';
import {
  createAsset,
  getAsset,
  getAssetByRid,
  getAssetHistory,
  getHistory,
  type ChainAsset,
  updateAsset
} from '../blockchain/contracts/tdrAssetContract';

interface CreateAssetPayload {
  application_id: string;
  tdrApplicationId?: string;
  rid: string;
  hash: string;
  remaining_tdr_value?: number;
  utilized_tdr_value?: number;
  owner?: string;
  district?: string;
}

interface UpdateAssetPayload {
  application_id: string;
  tdrApplicationId?: string;
  rid: string;
  hash: string;
  land_objection_count?: number;
  plot_objection_count?: number;
  submit_status?: string;
  updated_by?: number;
  updated_role?: number;
}

export const pushCreateAsset = async (
  payload: CreateAssetPayload
): Promise<{ txId: string; success: boolean }> => {
  const txId = `0x${crypto.randomBytes(16).toString('hex')}`;

  await createAsset({
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

export const pushUpdateAsset = async (
  payload: UpdateAssetPayload
): Promise<{ txId: string; success: boolean }> => {
  const txId = `0x${crypto.randomBytes(16).toString('hex')}`;

  try {
    await updateAsset({
      application_id: payload.application_id,
      tdrApplicationId: payload.tdrApplicationId,
      rid: payload.rid,
      hash: payload.hash,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    if (statusCode === 404) {
      (error as { code?: string }).code = 'BLOCKCHAIN_ASSET_NOT_FOUND';
    }
    // Self-heal for simulator mode: if blockchain map is empty after restart,
    // seed the asset on first update using current payload.
    if (statusCode === 404) {
      await createAsset({
        application_id: payload.application_id,
        tdrApplicationId: payload.tdrApplicationId,
        rid: payload.rid,
        hash: payload.hash,
        timestamp: new Date().toISOString()
      });
    } else {
      throw error;
    }
  }

  return {
    txId,
    success: true
  };
};
export const fetchAssetHistory = async (
  application_id: string
): Promise<Array<{ txId: string; timestamp: string; value: unknown; isDelete: boolean }>> => {
  return getAssetHistory(application_id);
};

/** Same ledger as `fetchAssetHistory`; maps to chaincode method `getHistory`. */
export const fetchBlockchainHistory = async (application_id: string) => getHistory(application_id);

export const fetchAssetByApplicationId = async (application_id: string): Promise<ChainAsset | null> =>
  getAsset(application_id);

export const fetchAssetByRid = async (rid: string): Promise<ChainAsset | null> => getAssetByRid(rid);

