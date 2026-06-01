import crypto from 'crypto';

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((v) => normalizeValue(v));
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = normalizeValue(obj[key]);
    }
    return out;
  }
  return value ?? null;
}

export function generateDeterministicHash(payload: unknown): string {
  const normalized = normalizeValue(payload);
  const json = JSON.stringify(normalized);
  return crypto.createHash('sha256').update(json, 'utf8').digest('hex');
}
