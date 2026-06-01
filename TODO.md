# Secure API Key Authentication - Production Ready ✅

## Status
- [x] API Key Model (`src/models/ApiKeyAgency.js`)
- [x] API Key Service (`src/services/apiKeyService.js`)
- [x] API Key Middleware (`src/middleware/apiKey.js`)
- [x] Routes Protected (`src/routes/tdrRoutes.js`)
- [x] Migration Script (`migrate-api-keys.js`)
- [x] Env Key Sync (`ApiKeyService.syncEnvApiKey()`)
- [x] Setup Verification (`seed-api-keys.js`)
- [x] Postman Collection (`tdr-api.postman_collection.json`)
- [x] Admin Routes (`src/routes/adminRoutes.js`)
- [x] App Updated (`src/app.js`)

## Production Setup

### 1. Configure API_KEY in .env
```bash
# .env
API_KEY=your-secret-production-key-here
MONGO_URI=mongodb://localhost:27017/tdr-blockchain
PORT=3000
```

### 2. Verify Setup
```bash
node seed-api-keys.js
```
This verifies your .env API_KEY is synced to the database.

### 3. Start Server
```bash
npm run dev
```
Server automatically syncs `API_KEY` from .env to database on startup.

### 4. Test with Postman
- Import `tdr-api.postman_collection.json`
- Set environment variable `apiKey` = your .env API_KEY value
- Test all endpoints end-to-end

## API Key Management (Admin)
```
POST   /api/admin/api-keys      - Generate additional keys
GET    /api/admin/api-keys      - List all keys
DELETE /api/admin/api-keys/:id  - Deactivate key
```

## Protected Endpoints (Require x-api-key header)
```
POST   /api/tdr/push                          - Push TDR data
GET    /api/tdr/verify/:applicationId         - Verify agreement
GET    /api/tdr/transfer/verify/:applicationId - Verify transfer
GET    /api/tdr/qr/:applicationId             - QR verification
GET    /api/admin/api-keys                    - Admin key management
```

## Security Features
- API keys stored as bcrypt hashes (never plaintext)
- Environment key (ENV agency) synced from .env on startup
- Additional keys can be created via admin API
- Usage tracking: usage_count, last_used timestamps
- Key rotation: Change .env API_KEY, restart server, old key auto-deactivated
