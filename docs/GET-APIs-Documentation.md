# TDR Backend - GET APIs Documentation

This document covers all current `GET` APIs in the TDR backend, including purpose, request format, and response format.

---

## 1) Health Check

**Endpoint**  
`GET /health`

**Auth**  
No auth required.

**Purpose**  
Checks if backend is running.

**Success Response (200)**
```json
{
  "status": "OK",
  "timestamp": "2026-05-07T09:42:49.619Z"
}
```

---

## 2) Applications History List

**Endpoint**  
`GET /api/tdr/history/applications`

**Auth**  
Required: `x-api-key`

**Purpose**  
Returns all TDR applications with summary + blockchain history list for each application.

**Headers**
- `x-api-key: <API_KEY>`

**Success Response (200)**
```json
{
  "success": true,
  "count": 2,
  "applications": [
    {
      "application_id": "TDR-1778146562596-19B71F7ECAB4",
      "tdrApplicationId": "APP-2026-001",
      "rid": "MP-BPL-KZM-026-10qoo00a4",
      "owner_name": "Owner Name",
      "district": "Bhopal",
      "status": "DRC_GENERATED",
      "total_tdr_value": 100,
      "utilized_tdr_value": 10,
      "remaining_tdr_value": 90,
      "createdAt": "2026-05-07T08:00:00.000Z",
      "updatedAt": "2026-05-07T09:00:00.000Z",
      "mongo_ledger_count": 3,
      "blockchain_history": [
        {
          "txId": "0xabc123",
          "timestamp": "2026-05-07T08:00:10.000Z",
          "value": {},
          "isDelete": false
        }
      ]
    }
  ]
}
```

---

## 3) Get Full TDR by Application + RID

**Endpoint**  
`GET /api/tdr/:application_id/full?rid=<RID>`

**Auth**  
Required: `x-api-key`

**Purpose**  
Returns full stored TDR document for given `application_id` and `rid`.

**Path Params**
- `application_id` (string, required)

**Query Params**
- `rid` (string, required)

**Example**
`GET /api/tdr/TDR-1778146562596-19B71F7ECAB4/full?rid=MP-BPL-KZM-026-10qoo00a4`

**Success Response (200)**
```json
{
  "success": true,
  "application_id": "TDR-1778146562596-19B71F7ECAB4",
  "rid": "MP-BPL-KZM-026-10qoo00a4",
  "tdr": {
    "application_id": "TDR-1778146562596-19B71F7ECAB4",
    "tdrApplicationId": "APP-2026-001",
    "rid": "MP-BPL-KZM-026-10qoo00a4",
    "owner": {},
    "project": {},
    "land": {},
    "documents": {}
  }
}
```

---

## 4) Get Blockchain History (Chaincode `getHistory`)

**Endpoint**  
`GET /api/tdr/:application_id/blockchain/history`

**Auth**  
Required: `x-api-key`

**Purpose**  
Returns blockchain ledger history entries for one application.

**Path Params**
- `application_id` (string, required)

**Success Response (200)**
```json
{
  "success": true,
  "application_id": "TDR-1778146562596-19B71F7ECAB4",
  "chaincode_method": "getHistory",
  "history": [
    {
      "txId": "0xabc123",
      "timestamp": "2026-05-07T08:00:10.000Z",
      "value": {},
      "isDelete": false
    }
  ]
}
```

---

## 5) Get Ledger Snapshot

**Endpoint**  
`GET /api/tdr/ledger/snapshot?application_id=<APP_ID>&rid=<RID>`

**Auth**  
Required: `x-api-key`

**Purpose**  
Returns ledger + balance snapshot from Mongo for given application.

**Query Params**
- `application_id` (string, required)
- `rid` (string, required)

**Success Response (200)**
```json
{
  "success": true,
  "application_id": "TDR-1778146562596-19B71F7ECAB4",
  "rid": "MP-BPL-KZM-026-10qoo00a4",
  "snapshot": {
    "ledger": [],
    "total_tdr_value": 100,
    "utilized_tdr_value": 10,
    "remaining_tdr_value": 90
  }
}
```

---

## 6) Get Ledger Hash

**Endpoint**  
`GET /api/tdr/ledger/hash?application_id=<APP_ID>&rid=<RID>`

**Auth**  
Required: `x-api-key`

**Purpose**  
Returns deterministic hash from current ledger + balance snapshot.

**Query Params**
- `application_id` (string, required)
- `rid` (string, required)

**Success Response (200)**
```json
{
  "success": true,
  "application_id": "TDR-1778146562596-19B71F7ECAB4",
  "rid": "MP-BPL-KZM-026-10qoo00a4",
  "hash": "sha256hash"
}
```

---

## 7) Admin - List API Keys

**Endpoint**  
`GET /api/admin/api-keys`

**Auth**  
Required: `x-api-key`

**Purpose**  
Lists active/inactive API keys for admin operations.

**Success Response (200)**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "681b...",
      "agency": "TDR",
      "status": "ACTIVE"
    }
  ]
}
```

---

## Enterprise Error Response Format (All APIs)

If any GET API fails, backend returns enterprise format:

```json
{
  "success": false,
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "The requested resource was not found.",
  "action": "Please verify identifiers and try again.",
  "timestamp": "2026-05-07T09:42:49.619Z"
}
```

Common `errorCode` values:
- `VALIDATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `BLOCKCHAIN_ASSET_NOT_FOUND`
- `BLOCKCHAIN_DATA_MISMATCH`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`
