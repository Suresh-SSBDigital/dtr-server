import TDR from '../models/tdr';
import { generateDataHash } from './hashService';
import { pushUpdateAsset } from './blockchainService';
import { buildLedgerEntry } from './ledgerService';

type DocumentType = 'form1' | 'form11' | 'form12' | 'form13';

export interface UploadDocumentPayload {
  application_id: string;
  samagra_id: string;
  performed_by: string;
  file_url: string;
  document_type: DocumentType;
  remarks?: string;
  utilized_tdr?: number;
  ledger_snapshot?: number;
  utilization_id?: string;
  drc_id?: string;
  drc_certificate_no?: string;
  approval_authority?: string;
}

function httpError(statusCode: number, message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export const uploadLifecycleDocument = async (
  payload: UploadDocumentPayload
): Promise<{ txId: string; hash: string; application_id: string; rid: string }> => {
  const tdr = await TDR.findOne({
    application_id: payload.application_id,
    'owner.samagra_id': payload.samagra_id
  });
  if (!tdr) throw httpError(404, 'TDR record not found for application_id and samagra_id');
  const rid = String((tdr as any).rid);

  const uploaded_at = new Date();
  const docHash = await generateDataHash({
    application_id: payload.application_id,
    rid,
    document_type: payload.document_type,
    file_url: payload.file_url,
    uploaded_at: uploaded_at.toISOString(),
    utilized_tdr: payload.utilized_tdr,
    ledger_snapshot: payload.ledger_snapshot,
    utilization_id: payload.utilization_id,
    drc_id: payload.drc_id,
    drc_certificate_no: payload.drc_certificate_no,
    approval_authority: payload.approval_authority
  });

  const setPayload: Record<string, unknown> = {
    [`documents.${payload.document_type}`]: {
      file_url: payload.file_url,
      hash: docHash,
      uploaded_at,
      ...(typeof payload.utilized_tdr === 'number' ? { utilized_tdr: payload.utilized_tdr } : {}),
      ...(typeof payload.ledger_snapshot === 'number' ? { ledger_snapshot: payload.ledger_snapshot } : {}),
      ...(payload.utilization_id ? { utilization_id: payload.utilization_id } : {}),
      ...(payload.drc_id ? { drc_id: payload.drc_id } : {}),
      ...(payload.drc_certificate_no ? { drc_certificate_no: payload.drc_certificate_no } : {}),
      ...(payload.approval_authority ? { approval_authority: payload.approval_authority } : {})
    }
  };

  if (payload.document_type === 'form12') {
    setPayload['project.status'] = 'UTILIZATION_FINALIZED';
  }

  if (payload.document_type === 'form13') {
    const snapshot = Number(payload.ledger_snapshot ?? tdr.remaining_tdr_value ?? 0);
    setPayload.remaining_tdr_value = snapshot;
    setPayload.utilized_tdr_value = Number(tdr.total_tdr_value ?? 0) - snapshot;
  }

  const updated = await TDR.findOneAndUpdate(
    { application_id: payload.application_id, rid },
    { $set: setPayload },
    { new: true }
  );

  if (!updated) throw httpError(500, 'Failed to update document lifecycle');

  const lifecycleHash = await generateDataHash({
    application_id: payload.application_id,
    rid,
    document_type: payload.document_type,
    document: (updated.documents as any)?.[payload.document_type],
    status: (updated.project as any)?.status,
    balances: {
      total_tdr_value: updated.total_tdr_value,
      utilized_tdr_value: updated.utilized_tdr_value,
      remaining_tdr_value: updated.remaining_tdr_value
    }
  });

  const chain = await pushUpdateAsset({
    application_id: payload.application_id,
    rid,
    hash: lifecycleHash
  });

  const ledgerEntry = buildLedgerEntry({
    action: `${payload.document_type.toUpperCase()}_UPLOADED`,
    document_type: payload.document_type.toUpperCase(),
    performed_by: payload.performed_by,
    previous_status: (tdr.project as any)?.status,
    new_status: (updated.project as any)?.status ?? 'UPDATED',
    remarks: payload.remarks,
    txId: chain.txId,
    hash: lifecycleHash
  });

  await TDR.findOneAndUpdate(
    { application_id: payload.application_id, rid },
    { $push: { ledger: ledgerEntry } }
  );

  return {
    txId: chain.txId,
    hash: lifecycleHash,
    application_id: payload.application_id,
    rid
  };
};

export const getLedgerSnapshot = async (application_id: string, samagra_id: string) => {
  const tdr = await TDR.findOne(
    { application_id, 'owner.samagra_id': samagra_id },
    { ledger: 1, remaining_tdr_value: 1, utilized_tdr_value: 1, total_tdr_value: 1 }
  );
  if (!tdr) throw httpError(404, 'TDR record not found for application_id and samagra_id');
  return tdr;
};

export const generateLedgerHash = async (application_id: string, samagra_id: string) => {
  const tdr = await TDR.findOne(
    { application_id, 'owner.samagra_id': samagra_id },
    { rid: 1, ledger: 1, remaining_tdr_value: 1, utilized_tdr_value: 1, total_tdr_value: 1 }
  );
  if (!tdr) throw httpError(404, 'TDR record not found for application_id and samagra_id');
  const rid = String((tdr as any).rid);
  const hash = await generateDataHash({
    application_id,
    rid,
    ledger: tdr.ledger ?? [],
    balances: {
      total_tdr_value: tdr.total_tdr_value,
      utilized_tdr_value: tdr.utilized_tdr_value,
      remaining_tdr_value: tdr.remaining_tdr_value
    }
  });
  return { hash, snapshot: tdr };
};

