TruEstate Backend

Small Express backend exposing `/api/sales` for the assignment.

Run:

```bash
cd backend
npm install
npm run dev
```

If you have the CSV dataset (e.g. `truestate_assignment_dataset.csv`), convert it to JSON for the server data store:

```bash
# from repository root
cd backend
npm install
node scripts/convert_csv.js "C:/path/to/truestate_assignment_dataset.csv" data/sales.json
```

After conversion the server will load `data/sales.json`.

API:
- `GET /api/sales` — query params:
  - `q` (search string for customer name or phone)
  - `filters` (JSON-encoded object, e.g. `{"Customer Region":["North"]}`)
  - `sortField`, `sortDir` (e.g. `date`, `desc`)
  - `page`, `pageSize`

The backend uses `data/sales.json` as the dataset. Replace with real DB in production.
