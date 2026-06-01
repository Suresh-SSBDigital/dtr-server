# TDR Blockchain Backend API Documentation

## Stack
- Node.js, Express.js, TypeScript
- MongoDB, Mongoose
- Hyperledger Fabric-style asset lifecycle (`createAsset`, `updateAsset`, `queryAsset`, `getHistory`)

## Collection Folder Structure
1. CREATE FLOW
2. DRC FLOW
3. TRANSFER FLOW
4. UTILIZATION FLOW
5. DOCUMENT FLOW
6. LEDGER FLOW
7. BLOCKCHAIN FLOW
8. STATUS FLOW

Postman files:
- `docs/postman/TDR-Blockchain-Backend.postman_collection.json`
- `docs/postman/TDR-Blockchain-Backend.postman_environment.json`

## API Inventory

### CREATE APIs
- `POST /api/tdr/create`
- `POST /api/tdr/update-drc`
- `POST /api/tdr/transfer`
- `POST /api/tdr/utilization`

### WORKFLOW APIs
- `POST /api/tdr/update-owner-ready-for-drc`
- `POST /api/tdr/update-application-status`

### DOCUMENT APIs
- `POST /api/tdr/upload-form1`
- `POST /api/tdr/upload-form11`
- `POST /api/tdr/upload-form12`
- `POST /api/tdr/upload-form13`

### READ APIs
- `GET /api/tdr/:application_id`
- `GET /api/tdr/:application_id/history`
- `GET /api/tdr/:application_id/ledger`
- `GET /api/tdr/:application_id/blockchain`

> Note: Some paths above are canonical product endpoints for integration teams. In your current codebase, a subset is available with equivalent lifecycle handlers. Keep these as gateway-level aliases in production API gateway.

## Standard Headers
- `Content-Type: application/json`
- `x-api-key: {{apiKey}}`
- `Authorization: Bearer {{jwtToken}}` (placeholder for JWT)

## Standard Success Response Shape
```json
{
  "success": true,
  "application_id": "TDR-123",
  "txId": "0x...",
  "hash": "sha256..."
}
```

## Standard Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["\"field\" is required"]
}
```

## Standard Blockchain Update Trace
```json
{
  "event": "updateAsset",
  "application_id": "TDR-123",
  "txId": "0x...",
  "onChain": {
    "hash": "sha256...",
    "timestamp": "2026-05-06T11:00:00.000Z"
  }
}
```

## MongoDB Collection Strategy

### Primary Collection
- `TDR`
  - Core legal/business lifecycle aggregate
  - Contains workflow status, balances, transfer/utilization history, document references and hashes, ledger events

### Optional Production Collections
1. `tdr_audit_logs`
   - Request/response metadata, actor, IP, service latency, outcome
2. `tdr_blockchain_logs`
   - txId, hash, chaincode fn, block number, commit status
3. `tdr_document_logs`
   - document type, storage ref, hash, uploader, retention policy
4. `tdr_transfer_history`
   - denormalized transfer analytics/reporting table
5. `tdr_utilization_history`
   - denormalized utilization analytics/reporting table

## Document Storage Model

### Local Uploads (dev)
- `uploads/tdr/<application_id>/<doc_type>/<filename>`

### Cloud Storage (prod)
- `s3://tdr-docs/{env}/{application_id}/{doc_type}/{version}.pdf`

### MongoDB Reference
```json
{
  "file_url": "https://...",
  "hash": "sha256...",
  "uploaded_at": "2026-05-06T11:00:00.000Z"
}
```

### On-Chain Footprint (proof-only)
- `application_id`
- `rid`
- `hash`
- `document_type`
- `timestamp`

Never store raw PDFs or confidential notes on-chain.

## Blockchain Documentation

### createAsset(application_id, rid, hash)
- Used once during initial TDR creation
- Creates immutable root state

### updateAsset(application_id, rid, hash)
- Used for DRC, transfer, utilization, form uploads, status updates
- Updates same asset lineage, no new asset id

### queryAsset(application_id)
- Reads latest chain proof

### getHistory(application_id)
- Returns immutable hash timeline

### Hash Lifecycle
1. API updates off-chain state (MongoDB + file/object store)
2. SHA256 hash computed from approved payload slice
3. `updateAsset` called with hash
4. txId + hash persisted to ledger/audit logs

## Ledger Documentation

### Form11 Lifecycle
- Utilization proof upload
- Adjusts `utilized_tdr_value` and `remaining_tdr_value`
- Adds ledger action + blockchain tx

### Form12 Lifecycle
- Utilization finalization/legal completion
- Updates project/status + ledger action

### Form13 Lifecycle
- Final legal ledger snapshot
- Stores snapshot ref/hash and closes period state

### Transfer Ledger
- Each transfer records from/to/value/remaining + tx hash

### Utilization Ledger
- Each utilization records before/after balances + tx hash

### Blockchain Transaction History
- Every lifecycle mutation writes one updateAsset tx
- Ledger entry links API action <-> txId <-> hash

## Security Model
- JWT placeholder for user identity and claims
- RBAC roles: `AGENCY_USER`, `DEPARTMENT_USER`, `ADMIN`, `AUDITOR`
- Document privacy via signed URLs, private buckets, least-privilege IAM
- Blockchain privacy model: proof-only hashes, no PII/raw files on-chain
- Hash verification endpoint compares stored document hash with recomputed hash

## Enterprise Architecture Notes
- Use API gateway aliases to preserve legacy paths while keeping canonical internal handlers
- Add idempotency keys for document uploads and transfer/utilization writes
- Add outbox/event bus for blockchain retry reconciliation
- Add periodic chain-vs-db integrity job
- Add retention/versioning for legal docs and immutable audit exports

