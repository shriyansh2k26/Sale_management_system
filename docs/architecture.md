# Architecture (Frontend)

## Frontend architecture

- Framework: React + Vite
- Entry: `frontend/src/main.jsx`
- Top-level UI: `frontend/src/App.jsx`
- Components: `frontend/src/components/` — SearchBar, FilterPanel, TransactionTable, SortingDropdown, PaginationControls
- Services: `frontend/src/services/api.js` (fetches data from `/sales_sample.json` or backend endpoint `/api/sales`)
- Utils: `frontend/src/utils/filterSortUtils.js` — centralized filtering, sorting and pagination logic
- Styles: `frontend/src/styles/App.css`

## Data flow

1. `App.jsx` fetches sales data via `fetchSales()`.
2. UI state (search, filters, sort, page) lives in `App.jsx`.
3. Data is transformed via `applyAll()` from `filterSortUtils` and passed to `TransactionTable`.
4. Components emit changes which update the central UI state in `App.jsx`.

## Folder structure

- frontend/
  - public/ (static assets and sample data)
  - src/
    - components/ (presentational and control components)
    - services/ (API calls)
    - utils/ (filter/sort/pagination logic)
    - styles/ (CSS)

## Module responsibilities

- `SearchBar`: collects search query and emits change
- `FilterPanel`: exposes multi-select filters and clear action
- `SortingDropdown`: sets sorting field and direction
- `TransactionTable`: renders paged rows and empty state
- `PaginationControls`: next/prev and page display
- `api.fetchSales`: single source for fetching dataset
- `filterSortUtils.applyAll`: single source of truth for filtering, sorting and pagination

